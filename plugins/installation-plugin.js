'use strict'
module.exports = (opts) => {
  const pkg = require('./package.json')
  return {
    installation () {
      return [
        '',
        '## Installation',
        '',
        'This module is installed via npm:',
        '',
        '``` sh',
        `npm install ${pkg.name} ${pkg.preferGlobal ? '--global' : '--save'}`,
        '```',
        '',
      ].join('\n')
    },
  }
}
