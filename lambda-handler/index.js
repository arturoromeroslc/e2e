const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const AWS = require('aws-sdk')
const AwsXRay = require('aws-xray-sdk-core')
const { sendCloudWatchData } = require('./cloudwatch')
const { testApp } = require('./testing')

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
  let hasTestFailed
  let browser
  let page
  let attempt = 1

  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    if (browser) {
      browser.close()
    }
  })

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
        headless: chromium.headless
      })
      page = await browser.newPage()

      await page.goto('https://determined-heyrovsky-44a865.netlify.com/')
      const url = await page.url()
      console.log(`loaded url: ${url}`)
      await testApp(page)
    } catch (error) {
      if (!error.matcherResult && attempt === 1) {
        console.log('😭 Puppeteer error 😞')
        console.log(error)
        attempt++
        await browserActions()
      } else if (error && error.matcherResult && error.matcherResult.message) {
        console.log('️❗ Assertion error ❗')
        console.log(error.matcherResult.message())
        hasTestFailed = true
      } else {
        console.log('not sure what happened 🤷🏽‍♀️')
        console.log(error)
        hasTestFailed = true
      }
    }
  }

  if (hasTestFailed) {
    console.log('🥺 Our e2e tests have failed 🤨')
  } else {
    console.log('✅ Our e2e tests have passed 🥰')
  }

  await sendCloudWatchData(hasTestFailed)
  return
}
