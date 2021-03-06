/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

import HaikuValidator from '../lib/haikuvalidator'
import { IpadicFeatures } from 'kuromoji'

describe('HaikuValidatorのテスト', () => {
  let hv: HaikuValidator

  before(done => {
    hv = new HaikuValidator()
    done()
  })

  it('俳句内にKNOWNでない文字列があればtrue、すべてKNOWNならfalseを返す', () => {
    expect(hv.hasUnknownWord([[
      { word_type: 'KNOWN' }
    ]] as IpadicFeatures[][])).to.equal(false)

    expect(hv.hasUnknownWord([[
      { word_type: 'UNKNOWN' },
      { word_type: 'KNOWN' }
    ]] as IpadicFeatures[][])).to.equal(true)
  })

  it('句は自立語から始まらなければならない', () => {
    expect(hv.startWithJiritsugo([[
      { pos: '名詞' }
    ]] as IpadicFeatures[][])).to.equal(true)

    expect(hv.startWithJiritsugo([[
      { pos: '名詞' },
      { pos: '助詞' }
    ]] as IpadicFeatures[][])).to.equal(true)
  })

  it('配列の次元を落とす汎用関数', () => {
    expect(hv.flatten([
      [1, 2], [3, 4]
    ])).to.deep.equal([1, 2, 3, 4])
  })
})
