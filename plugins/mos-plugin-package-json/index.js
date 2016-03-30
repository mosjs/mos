'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')

function plugin (markdown) {
  return readPkgUp({cwd: markdown.filePath})
    .then(result => Promise.resolve({
      package: result.pkg,
    }))
}
