const expect = require('expect')

const bestLaCroixFlavor = () => {
  return 'grapefruit'
}

try {
  expect(bestLaCroixFlavor()).toBe('grapefruit!')
} catch (error) {
  console.log(error.matcherResult.message())
}
