const zipFolder = require('zip-folder')
const path = require('path')
const spinner = require('ora')('packaging application...').start()

const { dir: ROOT_FOLDER } = path.parse(process.env.PWD)

zipFolder(
  ROOT_FOLDER + '/e2e/lambda-handler',
  ROOT_FOLDER + '/e2e/lambda-handler/index.zip',
  function(err) {
    if (err) {
      return spinner.fail(`oh no, error.`, err)
    } else {
      return spinner.succeed(`EXCELLENT, packaged. Now run:
      npm run deploy
    `)
    }
  }
)
