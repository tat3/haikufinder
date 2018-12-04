module.exports = class Markov {
  data: { [key: string]: string[]}
  constructor () {
    this.data = {}
  }

  add (words: string[]) {
    const acc = words.reduce((acc, word) => {
      const now = word === 'undefined' ? 'null' : word
      const prev = acc.prev === 'undefined' ? 'null' : acc.prev

      const baseHash = acc.data[prev] === undefined ? [] : acc.data[prev]
      const newData = addHash(acc.data, { [prev]: baseHash.concat([now]) })
      return { data: newData, prev: now }
    }, { data: this.data, prev: 'undefined' })
    this.data = acc.data
  }

  sample (word: string) {
    const words = this.data[word] === undefined ? [] : this.data[word]
    return words[Math.floor(Math.random() * words.length)]
  }

  make () {
    let word = 'null'
    const sentence = []
    while (word !== undefined) {
      sentence.push(word)
      word = this.sample(word)
    }
    return sentence.join('')
  }
}

const addHash = <T>(hash1: T, hash2: T) => Object.assign(hash1, hash2)
