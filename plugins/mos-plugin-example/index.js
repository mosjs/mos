'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const createExample = require('./lib/create-example')
const path = require('path')

function plugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        example: createExample(Object.assign({}, opts, {
          pkg,
          pkgRoot: path.dirname(result.path),
        })),
      })
    })
}
