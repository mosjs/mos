'use strict'
const fs = require('fs')
const path = require('path')
const stdoutToComments = require('./stdout-to-comments')
const removeLastEOL = require('./remove-last-eol')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  const example = function (relativeFilePath) {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(markdownDir, relativeFilePath)
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return reject(err)

        resolve('``` js\n' + escapeImportantComments(removeLastEOL(stdoutToComments(data))) + '\n```')
      })
    })
  }

  return example
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
