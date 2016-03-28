'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const createInstallation = require('./create-installation')

function plugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        installation: () => createInstallation(pkg),
      })
    })
}
