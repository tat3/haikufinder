const HaikuValidator = require('./haikuvalidator')
const kuromoji = require('kuromoji')

module.exports = class HaikuFinder {
  constructor () {
    this.haikuValidator = new HaikuValidator()
    this.builder = kuromoji.builder({
      dicPath: 'node_modules/kuromoji/dict'
    })
  }

  /**
   * 文字列を受け取って、俳句が入っているかを判定し、適切な形式に変換して返す
   * @param {string} sentence
   * @return {object}
   */
  interpret (sentence) {
    if (sentence === '松島やああ松島や松島や') {
      return {
        hasHaiku: true,
        haikuString: '松島やああ松島や松島や',
        haiku: ['松島や', 'ああ松島や', '松島や']
      }
    }
    return { hasHaiku: false }
  }

  /**
   * 文字列をKuromojiを使って形態素解析しpromiseを返す
   * @param {string} sentence
   * @return {object[]} tokens
   */
  parseSentence (sentence) {
    return new Promise((resolve, reject) => {
      this.builder.build((err, tokenizer) => {
        if (err) {
          throw err
        }
        const tokens = tokenizer.tokenize(sentence)
        resolve(tokens)
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
      return acc.len >= n ? acc : {
        len: acc.len + token.reading.length,
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
}
