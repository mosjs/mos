'use strict'
const automd = require('./lib/automd')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

const cwd = process.cwd()
const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
const pattern = path.resolve(cwd, '{/**/,/}*.{' + mdExtensions.join() + '}')

const plugins = [
  require('./plugins/package-json-plugin'),
  /* Installation section plugin */
  require('./plugins/installation-plugin'),
  /* License section plugin */
  require('./plugins/license-plugin'),
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
