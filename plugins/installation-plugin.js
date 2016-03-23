'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')

function createPlugin (opts) {
  const pkg = readPkgUp.sync({cwd: opts.filePath}).pkg
  return {
    installation () {
      return [
        '## Installation',
        '',
        'This module is installed via npm:',
        '',
        '``` sh',
        `npm install ${pkg.name} ${pkg.preferGlobal ? '--global' : '--save'}`,
        '```',
      ].join('\n')
    },
  }
}
