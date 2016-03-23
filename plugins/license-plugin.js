'use strict'
const readPkgUp = require('read-pkg-up')

module.exports = (opts) => {
  const pkg = readPkgUp.sync({cwd: opts.filePath}).pkg
  return {
    license () {
      return [
        '',
        '## License',
        '',
        `${pkg.license} © [${pkg.author.name}](${pkg.author.url})`,
        '',
      ].join('\n')
    },
  }
}
