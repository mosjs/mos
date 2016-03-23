'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')

function createPlugin (opts) {
  const pkg = readPkgUp.sync({cwd: opts.filePath}).pkg
  return {
    license () {
      return [
        '## License',
        '',
        `${pkg.license} © [${pkg.author.name}](${pkg.author.url})`,
      ].join('\n')
    },
  }
}
