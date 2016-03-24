'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const createInstallation = require('./create-installation')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then((result) => {
      const pkg = result.pkg

      return Promise.resolve({
        installation: () => createInstallation(pkg),
      })
    })
}
