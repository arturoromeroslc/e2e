const expect = require('expect')

exports.testApp = async page => {
  const title = await page.title()
  expect(title).toBe('Example Domain')
}
