'use strict'
module.exports = plugin

const readPkgUp = require('read-pkg-up')
const renderDeps = require('./lib/render-deps')
const path = require('path')

function plugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then(result => {
      const pkg = result.pkg

      return Promise.resolve({
        dependencies: () => '## Dependencies\n\n' + renderDeps({
          deps: pkg.dependencies,
          pkgRoot: path.dirname(result.path),
        }) + '\n',
        devDependencies: () => '## Dev Dependencies\n\n' + renderDeps({
          deps: pkg.devDependencies,
          pkgRoot: path.dirname(result.path),
        }) + '\n',
      })
    })
}
