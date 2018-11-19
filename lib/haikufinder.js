const HaikuValidator = require('./haikuvalidator')
const kuromoji = require('kuromoji')

module.exports = class HaikuFinder {
  constructor () {
    this.haikuValidator = new HaikuValidator()
    this.promiseTokenizer = this.getPromiseTokenizer()
  }

  /**
   * 文字列を受け取って、俳句が入っているかを判定し、適切な形式に変換して返す
   * @param {string} sentence
   * @return {object}
   */
  async interpret (sentence) {
    const tokens = await this.parseSentence(sentence)
    const res = this.searchFirstHaiku(tokens)
    if (res.status !== 'match') {
      return { hasHaiku: false, tokens: tokens }
    }
    return {
      hasHaiku: true,
      haikuString: sentence,
      haiku: res.tokens
        .map(ku => ku.reduce((acc, token) => acc + token.surface_form, '')),
      haikuTokens: res.tokens,
      tokens: tokens
    }
  }

  /**
   * tokensを先頭から調べて最初に見つけた俳句を返す
   * @param {object[]} tokens
   */
  searchFirstHaiku (tokens) {
    while (tokens.length !== 0) {
      const res = this.pickHaikuFromHead(tokens)
      if (res.status === 'match') { return res }
      tokens = tokens.slice(1)
    }
    return { status: 'fail' }
  }

  /**
   * 文字列をKuromojiを使って形態素解析しpromiseを返す
   * @param {string} sentence
   * @return {object[]} tokens
   */
  async parseSentence (sentence) {
    const tokenizer = await this.promiseTokenizer
    return tokenizer.tokenize(sentence)
  }

  /**
   * kuromojiのtokenizerのpromiseを保存
   */
  getPromiseTokenizer () {
    const builder = kuromoji.builder({
      dicPath: 'node_modules/kuromoji/dict'
    })
    return new Promise((resolve, reject) => {
      builder.build((err, tokenizer) => {
        if (err) {
          throw err
        }
        resolve(tokenizer)
      })
    })
  }

  /**
   * tokensの先頭からn文字目までを取り出す
   * @param {token[]} tokens
   * @param {num} n
   * @return {object}
   */
  pickNLetterWords (tokens, n) {
    const acc = tokens.reduce((acc, token) => {
      if (token.reading === undefined) { return acc }
      const str = this.reading(token.reading)
      return acc.len >= n ? acc : {
        len: acc.len + str.length,
        tokens: acc.tokens.concat([token])
      }
    }, { len: 0, tokens: [] })
    if (acc.len > n) { return { status: 'longer' } }
    if (acc.len < n) { return { status: 'shorter' } }
    return {
      status: 'match',
      tokens: acc.tokens
    }
  }

  /**
   * tokensを先頭から調べて5, 7, 5となる部分を抜き出す
   * @param {object[]} tokens
   * @return {object}
   */
  pickHaikuFromHead (tokens) {
    const haiku = [5, 7, 5].reduce((acc, on) => {
      if (acc.status !== 'match') { return acc }

      const kuRes = this.pickNLetterWords(acc.tail, on)
      if (kuRes.status !== 'match') { return { status: 'fail' } }
      const ku = kuRes.tokens
      return {
        status: 'match',
        tail: acc.tail.slice(ku.length),
        kus: acc.kus.concat([ku])
      }
    }, { status: 'match', tail: tokens, kus: [] })

    if (haiku.status !== 'match') { return { status: 'fail' } }
    return {
      status: 'match',
      tokens: haiku.kus
    }
  }

  /**
   * 文字列から音として計上されない文字を除く
   * @param {string} str
   */
  reading (str) {
    const chars = [/ァ/g, /ィ/g, /ゥ/g, /ェ/g, /ォ/g, /ャ/g, /ュ/g, /ョ/g]
    return chars.reduce((str, char) => str.replace(char, ''), str)
  }
}
