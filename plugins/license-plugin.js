'use strict'
module.exports = (opts) => {
  const pkg = require('./package.json')
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
