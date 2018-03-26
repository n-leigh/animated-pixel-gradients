/* eslint-env node */

// init project
const process = require('process')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const app = express()
const {generateRandomGif} = require('./bot_libs/puppeteer')
const {getTwitterClient, sendTweet} = require('./bot_libs/twitter')
require('dotenv').config()

app.use(helmet())
app.use(express.static('build'))

// Website endpoint
app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'build/client.html'))
})

// Base puppeteer endpoint
app.get('/puppeteer', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'build/puppeteer.html'))
})

// Tweet-making endpoint
app.get(`/${process.env.tweetEndpoint}`, (request, response) => {
  const port = process.env.PORT
  const scheme = `http${port === 443 ? 's' : ''}`
  const host = `${request.hostname}:${port}`
  const puppeteerURL = `${scheme}://${host}/puppeteer`
  const config = {
    width: 500,
    height: 200,
    scalingFactor: 4,
    wordList: [
      'trans girls', 'cyber girls', 'cat girls', 'sleepy girls',
      'nice girls', 'powerful girls', 'sword girls', 'deer girls',
      'slime girls'
    ],
    fontSize: 40
  }
  generateRandomGif(
    config, puppeteerURL,
    '#textarea-config-string',
    '#form-gif-config input[type="submit"]',
    '#gif-link'
  ).then((result) => {
    const client = getTwitterClient()
    sendTweet(client, result.options.text, result.imageData)
      .then(tweet => console.log(tweet))
      .catch(error => console.error(error))
    response.status(200).type(result.imageData.mime).send(result.imageData.buffer)
  }).catch((err) => {
    console.error(err)
    response.status(500).send(err.message)
  })
})

// listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})

// graceful shutdown
process.on('SIGINT', function () {
  listener.close()
  process.exit()
})
