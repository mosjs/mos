'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const createLicense = require('./create-license')

function plugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        license: () => createLicense(pkg),
      })
    })
}
