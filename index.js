'use strict'
const automd = require('./lib/automd')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const initPlugins = require('./lib/init-plugins')

const cwd = process.cwd()
const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
const pattern = path.resolve(cwd, '{/**/,/}*.{' + mdExtensions.join() + '}')

const plugins = [
  require('./plugins/package-json-plugin'),
  /* Installation section plugin */
  require('./plugins/installation-plugin'),
  /* License section plugin */
  require('./plugins/license-plugin'),
  require('./plugins/badges'),
]

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
  initPlugins(plugins, {filePath})
    .then((scope) => {
      const processMarkup = automd(scope)
      return processMarkup(md)
    })
    .then(newMD => {
      fs.writeFileSync(filePath, newMD, {
        encoding: 'utf8',
      })
    })
    .catch(err => {throw err})
}
