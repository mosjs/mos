'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')
const gh = require('github-url-to-object')
const createBadges = require('./create-badges')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then((result) => {
      const pkg = result.pkg

      const github = pkg.repository && pkg.repository.url &&
        gh(pkg.repository.url)

      if (!github) {
        return Promise
          .reject(new Error('The badges plugin only works for github repos'))
      }

      return Promise.resolve({
        badges: createBadges({ github, pkg, }),
      })
    })
}
