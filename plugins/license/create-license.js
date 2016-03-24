'use strict'
module.exports = pkg => [
  '## License',
  '',
  pkg.license + ' © ' +
  (pkg.author.url ?
    `[${pkg.author.name}](${pkg.author.url})` : pkg.author.name),
].join('\n')
