'use strict'
module.exports = processFiles

const fs = require('fs')
const glob = require('glob')

function processFiles (opts) {
  opts = opts || {}
  const afterEachRender = opts.afterEachRender
  const processor = opts.processor
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
        .all(files.map(processFile))
        .then(resolve)
        .catch(reject)
    })

    function processFile (filePath) {
      const currentMD = fs.readFileSync(filePath, 'utf8')
      return processor
        .process(currentMD, { filePath })
        .then(newMD => afterEachRender({
          newMD,
          currentMD,
          filePath,
        }))
    }
  })
}
