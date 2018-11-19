// const ashitaka = require('./lib/ashitaka.js')
// ashitaka(10)
const express = require('express')
const HaikuFinder = require('./lib/haikufinder')

const app = express()
const server = app.listen(3000, () => {
  console.log(`Node.js is listening to PORT: ${server.address().port}`)
})

const haikuFinder = new HaikuFinder()

app.get('/haiku/:sentence', async (req, res, next) => {
  const result = await haikuFinder.interpret(req.params.sentence)
  res.send(result)
})
