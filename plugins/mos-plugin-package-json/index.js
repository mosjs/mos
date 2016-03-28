'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')

function plugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => Promise.resolve({
      package: result.pkg,
    }))
}
