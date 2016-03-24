'use strict'
module.exports = renderAll

const automd = require('./automd')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const initPlugins = require('./init-plugins')

const cwd = process.cwd()
const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
const pattern = path.resolve(cwd, '{/**/,/}*.{' + mdExtensions.join() + '}')

const plugins = [
  require('../plugins/package-json-plugin'),
  require('../plugins/installation-plugin'),
  require('../plugins/license-plugin'),
  require('../plugins/badges'),
]

function renderAll (onRender) {
  glob(pattern, {
    ignore: '**/node_modules/**',
  }, (err, files) => {
    if (err) {
      throw err
    }

    files.forEach(renderFile)
  })

  function renderFile (filePath) {
    const currentMD = fs.readFileSync(filePath, 'utf8')
    initPlugins(plugins, {filePath})
      .then((scope) => {
        const processMarkup = automd(scope)
        return processMarkup(currentMD)
      })
      .then(newMD => onRender({
        newMD,
        currentMD,
        filePath,
      }))
      .catch(err => {throw err})
  }
}
