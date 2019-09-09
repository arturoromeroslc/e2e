const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const expect = require('expect')
const { sendCloudWatchData } = require('./cloudwatch')

exports.handler = async event => {
  let failedTest
  let browser
  let page
  let attempt = 1

  try {
    await browserActions()
  } finally {
    if (browser && page) {
      await page.waitFor(100)
      await browser.close()
      console.log('ending')
    }
  }

  async function browserActions() {
    console.log(`attempt: ${attempt}`)
    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        waitUntil: 'load'
      })
      page = await browser.newPage()

      await page.goto(event.url || 'https://example.com')
      const result = await page.title()
      console.log(`result: ${result}`)

      const bestLaCroixFlavor = () => {
        return 'grapefruit'
      }

      expect(bestLaCroixFlavor()).toBe('grapefruit!')
    } catch (error) {
      if (!error.matcherResult && attempt === 1) {
        console.log('Puppeteer error: ', error)
        attempt++
        await browserActions()
      } else if (error && error.matcherResult.message) {
        console.log('Assertion error:', error.matcherResult.message())
        failedTest = true
        return Promise.resolve()
      } else {
        failedTest = true
        return Promise.resolve()
      }
    }
  }

  if (failedTest) {
    console.log('The test has failed')
  }

  return await sendCloudWatchData(failedTest)
}
