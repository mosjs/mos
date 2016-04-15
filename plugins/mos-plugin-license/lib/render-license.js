'use strict'
const fileExists = require('file-exists')
const path = require('path')

module.exports = markdown => {
  const licensePath = path.resolve(path.dirname(markdown.filePath), 'LICENSE')
  const licenseFileExists = fileExists(licensePath)

  return [
    '## License',
    '',
    (licenseFileExists
      ? `[${markdown.pkg.license}](./LICENSE)`
      : markdown.pkg.license) + ' © ' +
    (markdown.pkg.author.url
      ? `[${markdown.pkg.author.name}](${markdown.pkg.author.url})`
      : markdown.pkg.author.name),
  ].join('\n')
}
