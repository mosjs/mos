'use strict'
module.exports = renderFiles

const mdRenderer = require('./md-renderer')
const fs = require('fs')
const glob = require('glob')
const createMDScope = require('./create-md-scope')

function renderFiles (opts) {
  opts = opts || {}
  const afterEachRender = opts.afterEachRender
  const plugins = opts.plugins
  const pattern = opts.pattern

  return new Promise((resolve, reject) => {
    glob(pattern, {
      ignore: '**/node_modules/**',
    }, (err, files) => {
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
      return createMDScope(plugins, {filePath})
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
