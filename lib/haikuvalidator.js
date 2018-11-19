module.exports = class HaikuValidator {
  /**
   * 俳句内にKNOWNでない文字列がないかを探す
   * @param {string[][]} haiku
   */
  hasUnknownWord (haiku) {
    haiku.forEach((ku) => {
      ku.forEach((token) => {
        if (token.word_type !== 'KNOWN') {
          return true
        }
      })
    })
    return false
  }
}
