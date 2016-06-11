const createShieldsRenderer = require('./create-shields-renderer')

export default function plugin (mos, markdown) {
  if (!markdown.repo || markdown.repo.host !== 'github.com') {
    throw new Error('The shields plugin only works for github repos')
  }

  mos.scope.shields = createShieldsRenderer({
    github: markdown.repo,
    pkg: markdown.pkg,
  })
}

plugin.attributes = {
  pkg: require('../package.json'),
}
