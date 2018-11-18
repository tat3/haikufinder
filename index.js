const fs = require('fs')
const kuromoji = require('kuromoji')
const Markov = require('./lib/markov.js')

const builder = kuromoji.builder({
  dicPath: 'node_modules/kuromoji/dict'
})

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

    for (let n = 0; n < 10; n++) {
      console.log(markov.make())
    }
  })
})
