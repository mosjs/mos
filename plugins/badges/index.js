'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const gh = require('github-url-to-object')
const createBadges = require('./create-badges')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then((result) => {
      const pkg = result.pkg

      const ghInfo = pkg.repository && pkg.repository.url && gh(pkg.repository.url)
      if (!ghInfo) {
        return Promise.reject(new Error('The badges plugin only works for github repos'))
      }

      return Promise.resolve({
        badges: createBadges({ ghInfo, pkg, }),
      })
    })
}
