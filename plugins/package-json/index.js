'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => Promise.resolve({
      package: result.pkg,
    }))
}
