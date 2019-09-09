const expect = require('expect')

const INPUT_BOX = '#downshift-0-input'
const ITEM = '#downshift-0-item-8'
const MINUTE = 60000

const getText = async (page, selector) => {
  await page.waitForSelector(selector, { timeout: 2 * 60000 })
  const $element = await page.$(selector)

  return await page.evaluate(element => element.innerText, $element)
}

exports.testApp = async page => {
  await page.waitForSelector(INPUT_BOX, { timeout: MINUTE })
  await page.type(INPUT_BOX, 'cookies')
  await page.waitForSelector(ITEM, { timeout: MINUTE })
  await page.click(ITEM)
  const total = await getText(page, '#total-count')
  expect(total).toBe(259)
  console.log('total was: ', total)
}
