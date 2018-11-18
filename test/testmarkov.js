/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const Markov = require('../lib/markov.js')

describe('テストツールが動いているかテスト', () => {
  it('1 + 1 = 2', () => {
    expect(1 + 1).to.equal(2)
  })
})

describe('Markovクラスのテスト', () => {
  let words
  before((done) => {
    words = ['a', 'b', 'c', 'c', 'd']

    done()
  })

  it('addにより辞書を格納', () => {
    const markov = new Markov()
    markov.add(words)
    expect(markov.data).to.deep.equal({
      [null]: ['a'],
      a: ['b'],
      b: ['c'],
      c: ['c', 'd']
    })
  })

  it('addに[]を渡すと空の辞書{}が登録される', () => {
    const markov = new Markov()
    markov.add([])
    expect(markov.data).to.deep.equal({})
  })

  it('addが複数呼ばれるとdataが追記される', () => {
    const markov = new Markov()
    const words2 = ['A', 'B', 'C']
    markov.add(words)
    markov.add(words2)
    expect(markov.data).to.deep.equal({
      [null]: ['a', 'A'],
      a: ['b'],
      b: ['c'],
      c: ['c', 'd'],
      A: ['B'],
      B: ['C']
    })
  })

  // TODO: makeのテストを追加
})
