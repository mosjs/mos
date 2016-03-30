'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const createExampleRenderer = require('./lib/create-example-renderer')
const path = require('path')

function plugin (markdown) {
  return readPkgUp({cwd: markdown.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        example: createExampleRenderer(Object.assign({}, markdown, {
          pkg,
          pkgRoot: path.dirname(result.path),
        })),
      })
    })
}
