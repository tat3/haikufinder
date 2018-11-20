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
    return hf.interpret('柿食えば鐘が鳴るなり法隆寺').then(res => {
      expect(res.hasHaiku).to.equal(true)
      expect(res.haikuString).to.equal('柿食えば鐘が鳴るなり法隆寺')
      expect(res.haiku).to.deep.equal(['柿食えば', '鐘が鳴るなり', '法隆寺'])
    })
  })

  it('異なる俳句に対しても正しく抽出する', () => {
    return hf.interpret('古池や蛙飛び込む水の音').then(res => {
      expect(res.hasHaiku).to.equal(true)
    })
  })

  it('俳句が入っていない文字列を受け取ると、hasHaikuだけを返す', () => {
    return hf.interpret('この文字列には俳句が入っていない').then((res) => {
      expect(res.hasHaiku).to.deep.equal(false)
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

  it('tokenに読点、コンマ、空白以外のreadingのない単語が入っていたら失敗', () => {
    const res = hf.pickHaikuFromHead([
      { reading: 'フルイケヤ' }, { surface_form: 'エクセル' },
      { reading: 'カワズトビコム' }, { reading: 'ミズノオト' }
    ])
    expect(res.status).to.deep.equal('fail')
  })

  it('tokenが読点、コンマ、空白のときは飛ばして続行する', () => {
    const res = hf.pickNLetterWords([
      { reading: 'フルイケヤ' },
      { surface_form: '、' }, { surface_form: ',' }, { surface_form: ' ' },
      { reading: 'カワズトビコム' }, { reading: 'ミズノオト' }
    ], 12)
    expect(res.status).to.deep.equal('match')
  })

  it('tokensの先頭から文字数が5, 7, 5となるように部分列を取り出す', () => {
    const haikuTokens = [
      { word_type: 'KNOWN', pos: '名詞', reading: 'フルイケ' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'ヤ' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'カワズ' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'トビコム' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'ミズ' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'ノ' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'オト' },
      { word_type: 'KNOWN', pos: '名詞', reading: 'ナド' }
    ]
    const tokens = hf.pickHaikuFromHead(haikuTokens)
    expect(tokens).to.deep.equal({
      status: 'match',
      tokens: [
        [
          { word_type: 'KNOWN', pos: '名詞', reading: 'フルイケ' },
          { word_type: 'KNOWN', pos: '名詞', reading: 'ヤ' }
        ],
        [
          { word_type: 'KNOWN', pos: '名詞', reading: 'カワズ' },
          { word_type: 'KNOWN', pos: '名詞', reading: 'トビコム' }
        ],
        [
          { word_type: 'KNOWN', pos: '名詞', reading: 'ミズ' },
          { word_type: 'KNOWN', pos: '名詞', reading: 'ノ' },
          { word_type: 'KNOWN', pos: '名詞', reading: 'オト' }
        ]
      ]
    })
  })

  it('tokensの先頭から5, 7, 5を取り出せなかった場合failを返す', () => {
    const tokens = hf.pickHaikuFromHead([
      { reading: 'フルイケ' }, { reading: 'ヤ' },
      { reading: 'ミズ' }, { reading: 'ノ' }, { reading: 'オト' },
      { reading: 'ナド' }
    ])
    expect(tokens).to.deep.equal({ status: 'fail' })
  })

  it('文字列から音として計上されない文字を除く', () => {
    expect(hf.reading({ reading: 'アァ' })).to.equal('ア')
  })

  it('ッは音として計上する', () => {
    expect(hf.reading({ reading: 'ッッァ' })).to.equal('ッッ')
  })
})
