const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const AWS = require('aws-sdk')
const AwsXRay = require('aws-xray-sdk-core')
const { METRIC_NAME_SPACE } = require('../utils')

const MINUTE = 60000

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

const cloudWatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })

const getMetricObject = ({ Value, MetricName }) => ({
  Timestamp: new Date(),
  Unit: 'Count',
  Value,
  MetricName
})

const getCloudWatchParam = hasError => {
  const cloudWatchParam = {
    Namespace: METRIC_NAME_SPACE,
    MetricData: []
  }

  if (hasError) {
    cloudWatchParam.MetricData.push(
      // @ts-ignore
      getMetricObject({ MetricName: 'failed-workflow', Value: 1 }),
      getMetricObject({ MetricName: 'successful-workflow', Value: 0 })
    )
  } else {
    cloudWatchParam.MetricData.push(
      // @ts-ignore
      getMetricObject({ MetricName: 'successful-workflow', Value: 1 }),
      getMetricObject({ MetricName: 'failed-workflow', Value: 0 })
    )
  }

  return cloudWatchParam
}

// const getText = async (page, selector) => {
//   await page.waitForSelector(selector, { timeout: 2 * MINUTE })
//   const $element = await page.$(selector)

//   return await page.evaluate(element => element.innerText, $element)
// }

// const clickButton = async (page, selector) => {
//   await page.waitForSelector(selector, { timeout: 2 * MINUTE })
//   const $element = await page.$(selector)

//   $element.click()
// }

exports.handler = async event => {
  let puppeteerError
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
      console.log('ending')
    }
  }

  const hasError = Boolean(puppeteerError)
  if (hasError) {
    console.log('The canary has failed')
  }

  await cloudWatch.putMetricData(getCloudWatchParam(hasError)).promise()
  return true

  async function browserActions() {
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

      return Promise.resolve()
    } catch (error) {
      console.log('Puppeteer error: ', error)
      if (typeof error.message === 'string' && attempt === 1) {
        attempt++
        await browserActions()
      } else {
        puppeteerError = true
        return Promise.resolve()
      }
    }
  }
}
