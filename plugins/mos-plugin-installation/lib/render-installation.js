'use strict'
const m = require('markdownscript')
const heading = m.heading
const text = m.text
const paragraph = m.paragraph
const code = m.code

module.exports = md => [
  heading({ depth: 2 }, [
    text({
      value: 'Installation',
    }),
  ]),
  paragraph([
    text({
      value: 'This module is installed via npm:',
    }),
  ]),
  code({
    lang: 'sh',
    value: createCommand(md),
  }),
]

function createCommand (md) {
  if (md.pkg.private || md.pkg.license === 'private') {
    return [
      `git clone ${md.repo.clone_url} && cd ./${md.repo.repo}`,
      'npm install',
    ].join('\n')
  }
  return `npm install ${md.pkg.name} ${md.pkg.preferGlobal ? '--global' : '--save'}`
}
