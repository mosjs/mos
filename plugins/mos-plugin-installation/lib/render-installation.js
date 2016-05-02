'use strict'
const m = require('markdownscript')
const h2 = m.h2
const p = m.paragraph
const code = m.code

module.exports = md => [
  h2(['Installation']),
  p(['This module is installed via npm:']),
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
