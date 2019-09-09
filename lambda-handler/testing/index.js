const expect = require('expect')
const { getText } = require('../puppeteer-utils')

const inputBox = '#downshift-0-input'
const EightItem = '#downshift-0-item-8'

exports.testApp = async page => {
  await page.waitForSelector(inputBox, { timeout: 2 * 60000 })
  await page.type(inputBox, 'cookies')
  await page.waitForSelector(EightItem, { timeout: 2 * 60000 })
  await page.click(EightItem)
  const total = await getText(page, '#total-count')
  console.log('total', total)
}
