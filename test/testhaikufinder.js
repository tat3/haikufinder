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

    const res2 = hf.interpret('古池や蛙飛び込む水の音')
    expect(res2.hasHaiku).to.equal(true)
  })

  it('俳句が入っていない文字列を受け取ると、hasHaikuだけを返す', () => {
    expect(hf.interpret('この文字列には俳句が入っていない'))
      .to.deep.equal({
        hasHaiku: false
      })
  })

  it('parseSentenceに文字列を渡して待つとtokenを返す', () => {
    hf.parseSentence('今').then((res) => {
      expect(res[0].surface_form).to.equal('今')
      expect(res[0].reading).to.equal('イマ')
    })
  })

  it('tokensの先頭からn文字目までを取り出す', () => {
    const tokens = hf.pickNLetterWords([
      { reading: 'フルイケ' },
      { reading: 'ヤ' },
      { reading: 'カワズ' }
    ], 5)
    expect(tokens).to.deep.equal({
      status: 'match',
      tokens: [
        { reading: 'フルイケ' },
        { reading: 'ヤ' }
      ]
    })
  })

  it('tokensがn文字に満たなかった場合、statusにshorterを入れる', () => {
    const tokens = hf.pickNLetterWords([
      { reading: 'フルイケ' }
    ], 5)
    expect(tokens).to.deep.equal({ status: 'shorter' })
  })

  it('tokensからn文字を取り出せなかった場合、statusにlongerを入れる', () => {
    const tokens = hf.pickNLetterWords([
      { reading: 'フルイケ' },
      { reading: 'ヤカワズ' }
    ], 5)
    expect(tokens).to.deep.equal({ status: 'longer' })
  })

  it('tokensの先頭から文字数が5, 7, 5となるように部分列を取り出す', () => {
    const tokens = hf.pickHaikuFromHead([
      { reading: 'フルイケ' }, { reading: 'ヤ' },
      { reading: 'カワズ' }, { reading: 'トビコム' },
      { reading: 'ミズ' }, { reading: 'ノ' }, { reading: 'オト' },
      { reading: 'ナド' }
    ])
    expect(tokens).to.deep.equal({
      status: 'match',
      tokens: [
        [{ reading: 'フルイケ' }, { reading: 'ヤ' }],
        [{ reading: 'カワズ' }, { reading: 'トビコム' }],
        [{ reading: 'ミズ' }, { reading: 'ノ' }, { reading: 'オト' }]
      ]
    })
  })

  it('tokensの先頭から5, 7, 5を取り出せなかった場合failを返す', () => {
    const tokens = hf.pickHaikuFromHead([
      { reading: 'フルイケ' }, { reading: 'ヤ' },
      { reading: 'ミズ' }, { reading: 'ノ' }, { reading: 'オト' },
      { reading: 'ナド' }
    ])
    expect(tokens).to.deep.equal({
      status: 'fail'
    })
  })
})
