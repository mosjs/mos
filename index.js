'use strict'
const automd = require('./lib/automd')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

const cwd = process.cwd()
const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
const pattern = path.resolve(cwd, '.{/**/,/}*.{' + mdExtensions.join() + '}')

const plugins = [
  (opts) => {
    return {
      package: require('./package.json'),
    }
  },
  /* Installation section plugin */
  (opts) => {
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
  },
  /* License section plugin */
  (opts) => {
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
  },
]

function createScope (opts) {
  return plugins
    .reduce((scope, plugin) => Object.assign(scope, plugin(opts)), {})
}

glob(pattern, {
  ignore: '**/node_modules/**',
}, (err, files) => {
  if (err) {
    throw err
  }

  files.forEach(renderFile)
})

function renderFile (filePath) {
  console.log('rendering', filePath)
  const md = fs.readFileSync(filePath, 'utf8')
  const scope = createScope({
    filePath,
  })
  const processMarkup = automd(scope)
  const newMD = processMarkup(md)
  fs.writeFileSync(filePath, newMD, {
    encoding: 'utf8',
  })
}
