'use strict'
module.exports = getShieldOpts

const readPkgUp = require('read-pkg-up')
const gh = require('github-url-to-object')

function getShieldOpts (markdown) {
  return readPkgUp({cwd: markdown.filePath})
    .then(result => {
      const pkg = result.pkg

      const repoInfo = pkg.repository && pkg.repository.url &&
        gh(pkg.repository.url)

      if (!repoInfo || repoInfo.host !== 'github.com') {
        return Promise
          .reject(new Error('The shields plugin only works for github repos'))
      }

      return Promise.resolve({ github: repoInfo, pkg })
    })
}
