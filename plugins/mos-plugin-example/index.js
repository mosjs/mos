'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const createExample = require('./lib/create-example')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        example: createExample(Object.assign({}, opts, { pkg, pkgRoot: result.path })),
      })
    })
}
