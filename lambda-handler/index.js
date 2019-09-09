const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const expect = require('expect')
const AWS = require('aws-sdk')
const AwsXRay = require('aws-xray-sdk-core')
const { sendCloudWatchData } = require('./cloudwatch')

const rules = {
  default: { fixed_target: 1, rate: 1.0 },
  version: 1
}

AwsXRay.middleware.setSamplingRules(rules)
AwsXRay.captureHTTPsGlobal(require('http'))
AwsXRay.captureHTTPsGlobal(require('https'))
AwsXRay.captureAWS(AWS)

AWS.config.logger = {
  log: msg => console.log(msg)
}

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
      console.log('Ending Lambda execution')
    }
  }

  async function browserActions() {
    console.log(`run attempt: ${attempt}`)
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
      const url = await page.url()
      console.log(`loaded url: ${url}`)

      const bestLaCroixFlavor = () => {
        return 'grapefruit'
      }

      expect(bestLaCroixFlavor()).toBe('grapefruit!')
    } catch (error) {
      if (!error.matcherResult && attempt === 1) {
        console.log('😭 Puppeteer error 😞 ')
        console.log(error)
        attempt++
        await browserActions()
      } else if (error && error.matcherResult.message) {
        console.log('️❗ Assertion error ❗')
        console.log(error.matcherResult.message())
        failedTest = true
      } else {
        console.log('not sure what happened 🤷🏽‍♀️')
        console.log(error)
        failedTest = true
      }
    }
  }

  if (failedTest) {
    console.log('🥺 Our e2e tests have failed 🤨')
  }

  await sendCloudWatchData(failedTest)
  return
}
