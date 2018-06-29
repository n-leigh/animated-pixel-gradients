# animated-pixel-gradients
Make pixelated gradient GIFs with words on them!

![Screenshot of app running](https://cdn.rawgit.com/noahleigh/animated-pixel-gradients/a7fd6c68/readme_assets/screenshot.png)

**Example GIF**

![Sample GIF with a purple and green gradient with the word "GRADIENT" in the middle](https://cdn.rawgit.com/noahleigh/animated-pixel-gradients/09eacf75/readme_assets/sample_gif.gif)

[Live version on Glitch 🎏](https://animated-pixel-gradients.glitch.me/)

[Fork on GitHub](https://github.com/noahleigh/animated-pixel-gradients)

## Install from GitHub
```
git clone https://github.com/noahleigh/animated-pixel-gradients.git
cd animated-pixel-gradients
npm install
```
## Run locally
```
npm start
```
Open `http://localhost:PORT/` in your browser with the port that it provided (e.g. `http://localhost:8080/`)

## Twitter bot usage
All you need to do to use this as a Twitter bot is to fill in the necessary information in a `.env` file in the project root.

Here is a sample `.env` template you can populate:
```
tweetEndpoint=

TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN_KEY=
TWITTER_ACCESS_TOKEN_SECRET=
```
- `tweetEndpoint` is the route that when visited, will trigger a tweet to be posted. If you're hosting this on a publically accessable server, you should use a hard-to-guess name to prevent abuse.
- For `TWITTER_*` values, see the [Authentication: Access Tokens](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html) guide on the Twitter developer documentation. Since this bot posts to an account, it needs a consumer to act on behalf of an account (the bot account).

Once these values are filled out, HTTP GET requests to the endpoint route you specified will post a tweet with a procedurally generated GIF and return the GIF. If you want the bot to post automatically, you'll need to setup a [cron job](https://www.google.com/search?q=free+web+cron) to hit your server on a regular interval.

## Libraries used
- [MainLoop.js](https://github.com/IceCreamYou/MainLoop.js) - Runs the update-draw loop for the animation preview
- [gif.js](https://github.com/jnordberg/gif.js) - Renders the GIF file
- [opentype.js](https://github.com/nodebox/opentype.js) - Draws the text on the canvas
- [spectrum](https://github.com/bgrins/spectrum) - Color picker for platforms that don't support `<input type="color">`
