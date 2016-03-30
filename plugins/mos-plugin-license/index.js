'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const renderLicense = require('./lib/render-license')

function plugin (markdown) {
  return readPkgUp({cwd: markdown.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        license: () => renderLicense(pkg),
      })
    })
}
