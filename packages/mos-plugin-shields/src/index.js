const createShieldsRenderer = require('./create-shields-renderer')

export default function plugin (mos, markdown) {
  if (!markdown.repo || markdown.repo.host !== 'github.com') {
    console.warn('The shields plugin only works for github repos')
    return
  }

  mos.scope.shields = createShieldsRenderer({
    github: markdown.repo,
    pkg: markdown.pkg,
  })
}

plugin.attributes = {
  pkg: require('../package.json'),
}
