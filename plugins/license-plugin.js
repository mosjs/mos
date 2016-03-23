'use strict'
module.exports = createPlugin

const readPkgUp = require('read-pkg-up')

function createPlugin (opts) {
  return readPkgUp({cwd: opts.filePath})
    .then((result) => {
      const pkg = result.pkg

      return Promise.resolve({
        license () {
          return [
            '## License',
            '',
            `${pkg.license} © [${pkg.author.name}](${pkg.author.url})`,
          ].join('\n')
        },
      })
    })
}
