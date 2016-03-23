'use strict'
const readPkgUp = require('read-pkg-up')

module.exports = (opts) => {
  return {
    package: readPkgUp.sync({cwd: opts.filePath}).pkg,
  }
}
