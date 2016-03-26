'use strict'
const path = require('path')
const stdoutToComments = require('./stdout-to-comments')
const removeLastEOL = require('./remove-last-eol')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  return example

  function example (relativeFilePath) {
    const filePath = path.resolve(markdownDir, relativeFilePath)
    return stdoutToComments(filePath)
      .then(code => {
        return Promise.resolve('``` js\n' +
          escapeImportantComments(removeLastEOL(code)) +
          '\n```')
      })
  }
}

function escapeImportantComments (code) {
  return escapeMultilineComments(escapeOneLineComments(code))
}

function escapeOneLineComments (code) {
  return code.replace(/\n*\/\/!(.+)\n*/g, (match, comment) => {
    return '\n```\n\n' + comment.trim() + '\n\n``` js\n'
  })
}

function escapeMultilineComments (code) {
  return code.replace(/\n*\/\*!([\s\S]+?)\*\/\n*/g, (match, comment) => {
    return '\n```\n\n' + comment.trim().replace(/\n\s+/g, '\n') + '\n\n``` js\n'
  })
}
