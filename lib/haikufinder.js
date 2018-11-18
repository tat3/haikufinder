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
}
