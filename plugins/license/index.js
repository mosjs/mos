'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const createLicense = require('./create-license')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then((result) => {
      const pkg = result.pkg

      return Promise.resolve({
        license: () => createLicense(pkg),
      })
    })
}
