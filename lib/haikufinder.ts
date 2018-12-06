import HaikuValidator from './haikuvalidator'
import { IpadicFeatures, Tokenizer, builder as Builder } from 'kuromoji'
import { isPrimitive } from 'util'

class HaikuFinder {
  haikuValidator: HaikuValidator
  promiseTokenizer: Promise<Tokenizer<IpadicFeatures>>
  constructor () {
    this.haikuValidator = new HaikuValidator()
    this.promiseTokenizer = this.getPromiseTokenizer()
  }

  /**
   * 文字列を受け取って、俳句が入っているかを判定し、適切な形式に変換して返す
   * @param {string} sentence
   * @return {object}
   */
  async interpret (sentence: string) {
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
   * @param {object[]} tokensInput
   */
  searchFirstHaiku (tokensInput: IpadicFeatures[]) {
    let tokens = tokensInput
      .filter(token => !['、', ',', ' ', '　'].includes(token.surface_form))
    while (tokens.length !== 0) {
      const res = this.pickHaikuFromHead(tokens)
      if (res.status === 'match') { return res }
      tokens = tokens.slice(1)
    }
    return { status: 'fail', tokens: [] }
  }

  /**
   * 文字列をKuromojiを使って形態素解析しpromiseを返す
   * @param {string} sentence
   * @return {object[]} tokens
   */
  async parseSentence (sentence: string) {
    const tokenizer = await this.promiseTokenizer
    return tokenizer.tokenize(sentence)
  }

  /**
   * kuromojiのtokenizerのpromiseを保存
   */
  getPromiseTokenizer (): Promise<Tokenizer<IpadicFeatures>> {
    const builder = Builder({
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
   * 読点、コンマ、空白以外でreadingを持たない文字があればstatus: longerを返す
   * @param {token[]} tokens
   * @param {num} n
   * @return {object}
   */
  pickNLetterWords (tokens: IpadicFeatures[], n: number) {
    const acc = tokens.reduce((acc, token) => {
      if (acc.len >= n) { return acc }
      if (token.reading === undefined) {
        return { len: n + 1, tokens: acc.tokens }
      }
      // カタカナのみ以外が含まれていると失敗。三点リーダや括弧を排除
      if (!token.reading.match(/^[ァ-ヶー]*$/)) {
        return { len: n + 1, tokens: acc.tokens }
      }
      const str = this.reading(token)
      return {
        len: acc.len + str.length,
        tokens: acc.tokens.concat([token])
      }
    }, { len: 0, tokens: [] as IpadicFeatures[] })
    if (acc.len > n) { return { status: 'longer', tokens: [] } }
    if (acc.len < n) { return { status: 'shorter', tokens: [] } }
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
  pickHaikuFromHead (tokens: IpadicFeatures[]) {
    const haiku = [5, 7, 5].reduce((acc, on) => {
      if (acc.status !== 'match') { return acc }

      const kuRes = this.pickNLetterWords(acc.tail, on)
      if (kuRes.status !== 'match') { return { status: 'fail', tail: [], kus: [] } }
      const ku = kuRes.tokens
      return {
        status: 'match',
        tail: acc.tail.slice(ku.length),
        kus: acc.kus.concat([ku])
      }
    }, { status: 'match', tail: tokens, kus: [] as IpadicFeatures[][] })

    if (haiku.status !== 'match') { return { status: 'fail', tokens: [] } }
    if (this.haikuValidator.hasUnknownWord(haiku.kus)) { return { status: 'fail', tokens: [] } }
    if (!this.haikuValidator.startWithJiritsugo(haiku.kus)) { return { status: 'fail', tokens: [] } }
    return {
      status: 'match',
      tokens: haiku.kus
    }
  }

  /**
   * tokenに対して特別な読み方を設定する
   * @param {object} token
   */
  reading (token: IpadicFeatures) {
    const chars = [/ァ/g, /ィ/g, /ゥ/g, /ェ/g, /ォ/g, /ャ/g, /ュ/g, /ョ/g]
    if (token.reading === undefined) {
      return ''
    }
    return chars.reduce((str, char) => str.replace(char, ''), token.reading)
  }
}

export default HaikuFinder
