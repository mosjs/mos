'use strict'
const path = require('path')
const jsToMarkdown = require('./js-to-markdown')
const independent = require('independent')
const codemo = require('codemo')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  const example = createExample()

  example.es6 = createExample({ es6: true })

  function createExample (codemoOpts) {
    return relativeFilePath => {
      const filePath = path.resolve(markdownDir, relativeFilePath)
      return codemo.processFile(filePath, codemoOpts)
        .then(code => independent({
          code: code.trim(),
          path: filePath,
        }))
        .then(jsToMarkdown)
    }
  }

  return example
}
