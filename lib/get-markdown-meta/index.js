'use strict'
module.exports = getMarkdownMeta

const readPkgUp = require('read-pkg-up')
const gh = require('github-url-to-object')
const path = require('path')

function getMarkdownMeta (filePath) {
  return readPkgUp({cwd: filePath})
    .then(result => {
      const pkg = result.pkg

      if (!pkg) return {}

      return {
        pkg,
        pkgRoot: path.dirname(result.path),
        repo: pkg.repository && pkg.repository.url && gh(pkg.repository.url),
      }
    })
    .then(opts => Object.assign(opts, {filePath}))
}
