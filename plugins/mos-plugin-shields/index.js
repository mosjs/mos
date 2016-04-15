'use strict'
module.exports = plugin

const createShieldsRenderer = require('./lib/create-shields-renderer')

function plugin (markdown) {
  if (!markdown.repo || markdown.repo.host !== 'github.com') {
    throw new Error('The shields plugin only works for github repos')
  }

  return {
    shields: createShieldsRenderer({
      github: markdown.repo,
      pkg: markdown.pkg,
    }),
  }
}
