const expect = require('expect')

const INPUT_BOX = '#downshift-0-input'
const ITEM = '#downshift-0-item-1'
const MINUTE_TIMEOUT = { timeout: 60000 }

const getText = async (page, selector) => {
  await page.waitFor(selector, MINUTE_TIMEOUT)
  const $element = await page.$(selector)

  return await page.evaluate(element => element.innerText, $element)
}

exports.foodResults = async page => {
  await page.waitFor(INPUT_BOX, MINUTE_TIMEOUT)
  await page.type(INPUT_BOX, 'cookies')
  await page.waitFor(ITEM, MINUTE_TIMEOUT)
  await page.click(ITEM)
  const total = await getText(page, '#total-count')
  expect(+total).toBeGreaterThan(0)
  console.log('total was: ', total)
}
