import KusValidator from './haikuvalidator'
import { IpadicFeatures, Tokenizer, builder as Builder } from 'kuromoji'
import Maybe from './maybe'

interface Response {
  hasHaiku: boolean
  tokens: Ku
  haikuString?: string
  haiku?: string[]
  haikuTokens?: Kus
}

type Ku = IpadicFeatures[]
type Kus = Ku[]

class HaikuFinder {
  haikuValidator: KusValidator
  promiseTokenizer: Promise<Tokenizer<IpadicFeatures>>
  constructor () {
    this.haikuValidator = new KusValidator()
    this.promiseTokenizer = this.getPromiseTokenizer()
  }

  /**
   * 文字列を受け取って、俳句が入っているかを判定し、適切な形式に変換して返す
   * @param {string} sentence
   * @return {object}
   */
  async interpret (sentence: string): Promise<Response> {
    const tokens = await this.parseSentence(sentence)
    const res = this.searchFirstHaiku(tokens)
    if (res.isNone()) { return { hasHaiku: false, tokens } }
    const kus = res.getOrElse([] as Kus)
    return {
      hasHaiku: true,
      haikuString: sentence,
      haiku: kus.map(ku => ku.reduce((acc, token) => acc + token.surface_form, '')),
      haikuTokens: kus,
      tokens: tokens
    }
  }

  /**
   * tokensを先頭から調べて最初に見つけた俳句を返す
   */
  searchFirstHaiku (tokensInput: Ku) {
    let tokens = tokensInput
      .filter(token => !['、', ',', ' ', '　'].includes(token.surface_form))
    while (tokens.length !== 0) {
      const res = this.pickHaikuFromHead(tokens)
      if (res.isSome()) { return res }
      tokens = tokens.slice(1)
    }
    return Maybe.none<Kus>()
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
   */
  pickNLetterWords (tokens: Ku, n: number) {
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
    }, { len: 0, tokens: [] as Ku })
    if (acc.len !== n) { return Maybe.none<Ku>() }
    return Maybe.fromValue(acc.tokens)
  }

  /**
   * tokensを先頭から調べて5, 7, 5となる部分を抜き出す
   */
  pickHaikuFromHead (tokens: Ku) {
    const haiku = [5, 7, 5].reduce((acc, on) => {
      if (acc.status !== 'match') { return acc }

      const kuRes = this.pickNLetterWords(acc.tail, on)
      if (kuRes.isNone()) { return { status: 'fail', tail: [], kus: [] } }
      const ku = kuRes.getOrElse([] as Ku)
      return {
        status: 'match',
        tail: acc.tail.slice(ku.length),
        kus: acc.kus.concat([ku])
      }
    }, { status: 'match', tail: tokens, kus: [] as Kus })

    if (haiku.status !== 'match') { return Maybe.none<Kus>() }
    if (this.haikuValidator.hasUnknownWord(haiku.kus)) { return Maybe.none<Kus>() }
    if (!this.haikuValidator.startWithJiritsugo(haiku.kus)) { return Maybe.none<Kus>() }
    return Maybe.fromValue(haiku.kus)
  }

  /**
   * tokenに対して特別な読み方を設定する
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
