/* eslint-env node */

// init project
const path = require('path')
const fs = require('fs')
const express = require('express')
const helmet = require('helmet')
const app = express()
const { twitterBotHandlerGenerator } = require('./bot_libs/bot')
require('dotenv').config()

app.use(helmet())
app.use(express.static('build'))

// Website endpoint
app.get('/', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'build/client.html'))
})

// Base puppeteer endpoint
app.get('/puppeteer', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'build/puppeteer.html'))
})

// Tweet-making endpoint
app.get(`/${process.env.tweetEndpoint}`, (request, response) => {
  // Load bot configuration
  fs.readFile('./botconfig.json', 'utf8', (err, data) => {
    if (err) throw err
    const botConfig = JSON.parse(data)
    twitterBotHandlerGenerator(botConfig)(request, response)
  })
})

// listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// graceful shutdown
process.on('SIGINT', function () {
  listener.close()
  process.exit()
})
