'use strict'
module.exports = renderFiles

const mdRenderer = require('./md-renderer')
const fs = require('fs')
const glob = require('glob')
const createMDScope = require('./create-md-scope')
const getMarkdownMeta = require('./get-markdown-meta')

function renderFiles (opts) {
  opts = opts || {}
  const afterEachRender = opts.afterEachRender
  const plugins = opts.plugins
  const pattern = opts.pattern
  const ignore = ['**/node_modules/**']
  if (opts.ignorePattern) {
    ignore.push(opts.ignorePattern)
  }

  return new Promise((resolve, reject) => {
    glob(pattern, { ignore }, (err, files) => {
      if (err) {
        return reject(err)
      }

      Promise
        .all(files.map(renderFile))
        .then(resolve)
        .catch(reject)
    })

    function renderFile (filePath) {
      const currentMD = fs.readFileSync(filePath, 'utf8')
      return getMarkdownMeta(filePath)
        .then(markdown => createMDScope(plugins, markdown))
        .then(scope => {
          const renderMD = mdRenderer(scope)
          return renderMD(currentMD)
        })
        .then(newMD => afterEachRender({
          newMD,
          currentMD,
          filePath,
        }))
    }
  })
}
