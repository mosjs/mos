'use strict'
module.exports = (pkg) => {
  if (pkg.private) {
    throw new Error('Cannot generate installation section for a private module')
  }
  return [
    '## Installation',
    '',
    'This module is installed via npm:',
    '',
    '``` sh',
    `npm install ${pkg.name} ${pkg.preferGlobal ? '--global' : '--save'}`,
    '```',
  ].join('\n')
}
