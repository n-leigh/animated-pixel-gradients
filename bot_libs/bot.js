const { generateRandomGif } = require('./puppeteer')
const { getTwitterClient, sendTweet } = require('./twitter')

const twitterBotHandlerGenerator = (config) => {
  const twitterBotHandler = async (request, response) => {
    const port = process.env.PORT
    const scheme = `http${port === 443 ? 's' : ''}`
    const host = `${request.hostname}:${port}`
    const puppeteerURL = `${scheme}://${host}/puppeteer`
    const gifResult = await generateRandomGif(
      config, puppeteerURL,
      '#textarea-config-string',
      '#form-gif-config input[type="submit"]',
      '#gif-link'
    )
    const client = getTwitterClient()
    try {
      const sentTweet = await sendTweet(client, gifResult.options.text, gifResult.imageData)
      console.log(sentTweet)
      response.status(200).type(gifResult.imageData.mime).send(gifResult.imageData.buffer)
    } catch (err) {
      console.error(err)
      response.status(500).send(err.message)
    }
  }
  return twitterBotHandler
}

module.exports = {
  twitterBotHandlerGenerator
}
