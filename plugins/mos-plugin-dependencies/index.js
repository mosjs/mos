'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const createDeps = require('./lib/create-deps')
const path = require('path')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        dependencies: () => '## Dependencies\n\n' + createDeps({
          deps: pkg.dependencies,
          pkgRoot: path.dirname(result.path),
        }) + '\n',
        devDependencies: () => '## Dev Dependencies\n\n' + createDeps({
          deps: pkg.devDependencies,
          pkgRoot: path.dirname(result.path),
        }) + '\n',
      })
    })
}
