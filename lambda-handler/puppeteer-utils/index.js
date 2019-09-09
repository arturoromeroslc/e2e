exports.getText = async (page, selector) => {
  await page.waitForSelector(selector, { timeout: 2 * 60000 })
  const $element = await page.$(selector)

  return await page.evaluate(element => element.innerText, $element)
}

exports.clickButton = async (page, selector) => {
  await page.waitForSelector(selector, { timeout: 2 * 60000 })
  const $element = await page.$(selector)

  $element.click()
}
