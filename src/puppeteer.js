/* eslint-env browser */
/** @module puppeteer */
import visitorFont from './assets/visitor1.ttf'
import * as opentype from 'opentype.js'
import makeGif from './makeGif.js'
import { setupAnimationState } from './utils.js'
import { createState, updateFactory, drawFactory } from './animatedGradientFuncs.js'

/**
 * Convenience function to take the contents of `form` and use them to configure
 * some animation functions that are used to generate an animated GIF.
 * @param {HTMLFormElement} stateConfig - Source of the configuration data for the animation
 * @param {opentype.Font} font - Font that will be used for the animation
 */
const renderGifHandler = (stateConfig, font) => {
  stateConfig.font = font
  const { initState, updateFunc, drawFunc } = setupAnimationState(
    createState, updateFactory, drawFactory, stateConfig
  )

  const finishedHandler = (blob) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const anchor = document.createElement('a')
      anchor.href = reader.result
      anchor.id = 'gif-link'
      anchor.textContent = 'Download GIF'
      document.body.appendChild(anchor)
    })
    reader.readAsDataURL(blob)
  }

  // Update GIF rendering message then create the GIF
  makeGif(
    initState, updateFunc, drawFunc, 1000 / 60,
    () => undefined,
    finishedHandler
  )
}

const form = document.getElementById('form-gif-config')
const configTextarea = document.getElementById('textarea-config-string')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const config = JSON.parse(configTextarea.value)
  opentype.load(visitorFont, (err, font) => {
    if (err) {
      console.error(err)
    } else {
      renderGifHandler(config, font)
    }
  })
})
