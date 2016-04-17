'use strict'
const path = require('path')
const resolve = require('resolve')
const jsToMarkdown = require('./js-to-markdown')

const codemo = require('codemo')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  const updateRequires = createRequireUpdater(opts.pkg, opts.pkgRoot)

  function example (relativeFilePath) {
    const filePath = path.resolve(markdownDir, relativeFilePath)
    return codemo.processFile(filePath)
      .then(code => {
        return jsToMarkdown(
            updateRequires(
              code.trim(),
              path.dirname(filePath)
            )
          )
      })
  }

  example.es6 = function (relativeFilePath) {
    const filePath = path.resolve(markdownDir, relativeFilePath)
    return codemo.processFile(filePath, { es6: true })
      .then(code => {
        return jsToMarkdown(
            updateRequires(
              code.trim(),
              path.dirname(filePath)
            )
          )
      })
  }

  return example
}

function createRequireUpdater (pkg, pkgRoot) {
  const pkgRes = path.resolve(pkgRoot, pkg.main || './index.js')

  return updateRequires

  function updateRequires (code, codeDir) {
    return code.replace(/require\(['"]([a-zA-Z0-9\-_\/\.]+)['"]\)/g, (match, requirePath) => {
      const res = resolvePath(requirePath)

      if (res !== pkgRes) return match

      return "require('" + pkg.name + "')"
    })
    .replace(/from ['"]([a-zA-Z0-9\-_\/\.]+)['"]/g, (match, requirePath) => {
      const res = resolvePath(requirePath)

      if (res !== pkgRes) return match

      return "from '" + pkg.name + "'"
    })

    function resolvePath (requirePath) {
      return resolve.sync(requirePath, { basedir: codeDir })
    }
  }
}
