// const ashitaka = require('./lib/ashitaka.js')
// ashitaka(10)
const express = require('express')
const bodyParser = require('body-parser')
const HaikuFinder = require('./lib/haikufinder')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Node.js is listening to PORT: ${server.address().port}`)
})

const haikuFinder = new HaikuFinder()

app.get('/', async (req, res, next) => {
  res.send(`
<h1>Let's try your cool sentence!</h1>
<form action="/" method="post">
  <input name="sentence">
  <button>send</button>
</form>
`)
})

app.post('/', async (req, res, next) => {
  const sentence = req.body.sentence
  if (sentence === undefined) {
    return res.send([])
  }
  const result = await haikuFinder.interpret(sentence)
  res.send(result)
})

app.get('/:sentence', async (req, res, next) => {
  const result = await haikuFinder.interpret(req.params.sentence)
  res.send(result)
})
