'use strict'
const path = require('path')
const stdoutToComments = require('./stdout-to-comments')
const removeLastEOL = require('./remove-last-eol')
const resolve = require('resolve')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  const updateRequires = createRequireUpdater(opts.pkg, opts.pkgRoot)

  return example

  function example (relativeFilePath) {
    const filePath = path.resolve(markdownDir, relativeFilePath)
    return stdoutToComments(filePath)
      .then(code => {
        return Promise.resolve('``` js\n' +
          escapeImportantComments(
            updateRequires(
              removeLastEOL(code),
              path.dirname(filePath)
            )
          ) +
          '\n```')
      })
  }
}

function createRequireUpdater (pkg, pkgRoot) {
  const pkgRes = path.resolve(pkgRoot, pkg.main || './index.js')

  return updateRequires

  function updateRequires (code, codeDir) {
    return code.replace(/require\(['"]([a-zA-Z0-9\-_\/\.]+)['"]\)/g, (match, requirePath) => {
      const res = resolve.sync(requirePath, { basedir: codeDir })

      if (res !== pkgRes) return match

      return "require('" + pkg.name + "')"
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
