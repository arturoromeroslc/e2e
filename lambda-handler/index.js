// https://5d774a6ee8d9e19674251c3a--determined-heyrovsky-44a865.netlify.com/
const chromium = require('chrome-aws-lambda')
//https://www.npmjs.com/package/chrome-aws-lambda
const puppeteer = require('puppeteer-core')
//https://www.npmjs.com/package/puppeteer-core#puppeteer-core
const AWS = require('aws-sdk')
const AwsXRay = require('aws-xray-sdk-core')
const { sendCloudWatchData } = require('./cloudwatch')
const { foodResults } = require('./e2e')

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

exports.handler = async _event => {
  let hasTestFailed = true
  let browser
  let page

  process.on('unhandledRejection', async (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    if (browser) {
      browser.close()
    }
    await sendCloudWatchData(hasTestFailed)
  })

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
    page = await browser.newPage()

    await page.goto(
      'https://5d785892c9900b0dea6d283a--determined-heyrovsky-44a865.netlify.com/'
    )
    const url = await page.url()
    console.log(`loaded url: ${url}`)
    await foodResults(page)
    hasTestFailed = true
  } catch (error) {
    if (!error.matcherResult) {
      console.log('😭 Puppeteer error 😞')
      console.log(error)
    } else if (error && error.matcherResult && error.matcherResult.message) {
      console.log('️❗ Assertion error ❗')
      console.log(error.matcherResult.message())
    } else {
      console.log('not sure what happened 🤷🏽‍♀️')
      console.log(error)
    }
  } finally {
    if (browser && page) {
      await page.waitFor(100)
      await browser.close()
      console.log('Ending Lambda execution')
    }
  }

  if (hasTestFailed) {
    console.log('🔴 Our e2e tests have failed 🥺')
  } else {
    console.log('✅ Our e2e tests have passed 💚')
  }

  await sendCloudWatchData(hasTestFailed)
  return
}
