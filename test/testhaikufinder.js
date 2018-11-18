/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const HaikuFinder = require('../lib/haikufinder')

describe('分解された文字列が575の形式になっているかどうか判定する', () => {
  let hf

  before((done) => {
    hf = new HaikuFinder()
    done()
  })

  it('俳句の入った文字列を受け取ると、その一つを抽出して返す', () => {
    const res = hf.interpret('松島やああ松島や松島や')
    expect(res.hasHaiku).to.equal(true)
    expect(res.haikuString).to.equal('松島やああ松島や松島や')
    expect(res.haiku).to.deep.equal(['松島や', 'ああ松島や', '松島や'])
  })

  it('俳句が入っていない文字列を受け取ると、hasHaikuだけを返す', () => {
    expect(hf.interpret('この文字列には俳句が入っていない'))
      .to.deep.equal({
        hasHaiku: false
      })
  })
})