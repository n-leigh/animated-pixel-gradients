const Twitter = require('twitter')

/**
 * Return a working twitter client object using tokens stored in environment variables.
 * Expects:
 *   - TWITTER_CONSUMER_KEY
 *   - TWITTER_CONSUMER_SECRET
 *   - TWITTER_ACCESS_TOKEN_KEY
 *   - TWITTER_ACCESS_TOKEN_SECRET
 * @returns {Twitter} Active Twitter client
 */
const getTwitterClient = () => {
  return new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })
}

/**
 * Delay the next step in an aync chain of events.
 * Source: https://esdiscuss.org/topic/await-settimeout-in-async-functions
 * @param {Number} duration - Time to delay in ms
 * @returns {Promise} Promise resolves after the duration
 */
const delay = (duration) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Send a tweet with an attached GIF.
 * @param {Twitter} client - Twitter client
 * @param {String} text - Text of the tweet
 * @param {HTMLImageElement} imageData - GIF to attach to the tweet
 * @returns {Promise} Resolves when tweet has posted
 */
const sendTweet = async (client, text, imageData) => {
  // Upload media using the chunked upload method
  let mediaId = null
  if (imageData) {
    // INIT
    const initResponse = await client.post(
      'media/upload',
      {
        command: 'INIT',
        total_bytes: imageData.buffer.byteLength,
        media_type: imageData.mime,
        media_category: 'tweet_gif'
      }
    )
    mediaId = initResponse.media_id_string
    // APPEND
    await client.post(
      'media/upload',
      {
        command: 'APPEND',
        media_id: mediaId,
        media: imageData.buffer,
        segment_index: 0
      }
    )
    // FINALIZE
    let finalizeResponse = await client.post(
      'media/upload',
      {
        command: 'FINALIZE',
        media_id: mediaId
      }
    )
    // Wait for procesing with STATUS if necessary
    while (finalizeResponse.processing_info &&
           (finalizeResponse.processing_info.state === 'in_progress' ||
            finalizeResponse.processing_info.state === 'pending')) {
      await delay(finalizeResponse.processing_info.check_after_secs * 1000)
      finalizeResponse = await client.get(
        'media/upload',
        {
          command: 'STATUS',
          media_id: mediaId
        }
      )
    }
    if (finalizeResponse.processing_info.state === 'failed') {
      throw Error(
        finalizeResponse.processing_info.state,
        finalizeResponse.processing_info.error.code,
        finalizeResponse.processing_info.error.name,
        finalizeResponse.processing_info.error.message
      )
    }
  }

  // Prepare tweet parameters
  const params = {
    status: text
  }
  // Add GIF media ID
  if (imageData) {
    params.media_ids = mediaId
  }
  // Send tweet
  return client.post('statuses/update', params)
}

module.exports = {
  getTwitterClient,
  sendTweet
}
