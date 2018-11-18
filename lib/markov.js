module.exports = class Markov {
  constructor () {
    this.data = {}
  }

  add (words) {
    const acc = words.reduce((acc, word) => {
      const now = word === undefined ? null : word
      const prev = acc.prev === undefined ? null : acc.prev

      const baseHash = acc.data[prev] === undefined ? [] : acc.data[prev]
      const newData = addHash(acc.data, { [prev]: baseHash.concat([now]) })
      return { data: newData, prev: now }
    }, { data: this.data, prev: undefined })
    this.data = acc.data
  }

  sample (word) {
    const words = this.data[word] === undefined ? [] : this.data[word]
    return words[Math.floor(Math.random() * words.length)]
  }

  make () {
    let word = null
    const sentence = []
    while (word !== undefined) {
      sentence.push(word)
      word = this.sample(word)
    }
    return sentence.join('')
  }
}

const addHash = (hash1, hash2) => Object.assign(hash1, hash2)
