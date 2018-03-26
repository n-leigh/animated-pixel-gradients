/* eslint-env node */
const isDocker = require('is-docker')
const puppeteer = require('puppeteer')
const ColorScheme = require('color-scheme')

/**
 * Convert a hex string representation of a color to a 3-Array of ints for RGB.
 *
 * Source: https://stackoverflow.com/a/5624139/9165387
 * @example
 * // Returns [155, 255, 79]
 * hexToRgb('#9bff4f')
 * @param {String} hex - A color in hex format (e.g. "#9bff4f")
 * @returns {Number[]} 3-array of integers representing `[R, G, B]`
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
  } else {
    throw new Error(`String "${hex}" is not a valid hexidecimal color`)
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

// https://intoli.com/blog/saving-images/
const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  if (matches.length !== 3) {
    throw new Error('Could not parse data URL.')
  }
  return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') }
}

/**
 * Open a URL in puppeteer, put in some configuration, click a button, then grab an image from
 * a newly created DOM node.
 * @param {string} url - The URL you want Puppeteer to visit
 * @param {Object} options - The options to be passed to the image generator
 * @param {string} optionsInputSelector - The input element where `options` will be stored
 * @param {string} submitSelector - CSS Selector for the button to click to start the image generation
 * @param {string} outputSelector - CSS selector for the element that is created when the generation
 * is complete. Should be an anchor tag with a DataURL in the `href` attribute.
 * @returns {Promise<Object>} Returns a Promise that resolves to an object with a `buffer` property
 * containing base64 encoded blob and a `mime` property describing the type of of the blob
 */
const getGeneratedImageData = async (url, options, optionsInputSelector, submitSelector, outputSelector) => {
  const browser = await puppeteer.launch({
    headless: true,
    // If we're inside a docker container, use --no-sandbox
    args: isDocker() ? ['--no-sandbox'] : []
  })
  const page = await browser.newPage()
  await page.goto(url)
  await page.evaluate((config, inputSelector, submitSelector) => {
    document.querySelector(inputSelector).value = JSON.stringify(config)
    document.querySelector(submitSelector).click()
  }, options, optionsInputSelector, submitSelector)
  await page.waitForSelector(outputSelector)
  // const link = await page.$(outputSelector)
  // const dataUrlHandle = await link.getProperty('href')
  // const dataUrl = await dataUrlHandle.jsonValue()
  const result = await page.$(outputSelector)
    .then(link => link.getProperty('href'))
    .then(dataUrlHandle => dataUrlHandle.jsonValue())
    .then(parseDataUrl)
  await browser.close()
  return result
}

const generateGifOptions = ({width, height, scalingFactor, wordList, fontSize}) => {
  const scheme = new ColorScheme()
  const schemeType = Math.random() < 0.5 ? 'contrast' : 'analogic'
  const fullColors = scheme
    .from_hue(Math.floor(Math.random() * 360))
    .scheme(schemeType)
    .colors()
  const colorIndexFirst = 0
  let colorIndexSecond = fullColors.length - 1
  if (schemeType === 'contrast') {
    colorIndexSecond = 5
  } else if (schemeType === 'analogic') {
    colorIndexSecond = 1
  }
  const colors = [fullColors[colorIndexFirst], fullColors[colorIndexSecond]].map(hexToRgb)
  const direction = ['UP', 'DOWN', 'LEFT', 'RIGHT'][getRandomIntInclusive(0, 3)]
  const text = wordList[getRandomIntInclusive(0, wordList.length - 1)]
  return {
    width: width,
    height: height,
    scalingFactor: scalingFactor,
    colors: colors,
    gradientDirection: direction,
    text: text,
    fontSize: fontSize
  }
}

const generateRandomGif = async (gifOptions, url, optionsInputSelector, submitSelector, outputSelector) => {
  const options = generateGifOptions(gifOptions)
  const imageData = await getGeneratedImageData(url, options, optionsInputSelector, submitSelector, outputSelector)
  return {
    options,
    imageData
  }
}

module.exports = {
  generateRandomGif
}
