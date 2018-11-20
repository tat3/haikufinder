module.exports = class HaikuValidator {
  /**
   * 俳句内にKNOWNでない文字列がないかを探す
   * @param {string[][]} haiku
   * @return {boolean}
   */
  hasUnknownWord (haiku) {
    return !this.flatten(haiku).every(token => token.word_type === 'KNOWN')
  }

  /**
   * 各句は名詞,動詞,形容詞,形容動詞, 副詞, 連体詞, 接続詞, 感動詞, 接頭詞, フィラー
   * のどれかから始まらないといけない
   * @param {string[][]} haiku
   * @return {boolean}
   */
  startWithJiritsugo (haiku) {
    const jiritsugo = ['名詞', '動詞', '形容詞', '形容動詞',
      '副詞', '連体詞', '接続詞', '感動詞', '接頭詞', 'フィラー']
    return haiku.every(ku => jiritsugo.includes(ku[0].pos))
  }

  /**
   * 二次元配列を一次元配列に落とす
   * @param {object[][]} itemss
   * @return {object[]}
   */
  flatten (itemss) {
    return itemss.reduce((acc, items) => acc.concat(items), [])
  }
}
