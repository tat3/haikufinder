const fs = require('fs')
const kuromoji = require('kuromoji')
const Markov = require('./markov.js')

const builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict'
})

const ashitaka = (nSentence) => {
  const markov = new Markov()

  builder.build((err, tokenizer) => {
    if (err) {
      throw err
    }

    fs.readFile('data/ashitaka.txt', 'utf8', (err, data) => {
      if (err) {
        throw err
      }

      const lines = data.split('\n')
      lines.forEach((line) => {
        const tokens = tokenizer.tokenize(line)
        const words = tokens.map(token => token.surface_form)
        markov.add(words)
      })

      /* eslint no-unused-vars: 0 */
      const _ = [...Array(nSentence).keys()].forEach((i) => {
        console.log(markov.make())
      })
    })
  })
}

module.exports = ashitaka
