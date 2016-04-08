'use strict'
const path = require('path')
const stdoutToComments = require('./stdout-to-comments')
const resolve = require('resolve')
const fs = require('fs')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const includePaths = require('rollup-plugin-includepaths')
const jsToMarkdown = require('./js-to-markdown')

module.exports = opts => {
  const markdownPath = opts.filePath
  const markdownDir = path.dirname(markdownPath)

  const updateRequires = createRequireUpdater(opts.pkg, opts.pkgRoot)

  function example (relativeFilePath) {
    const filePath = path.resolve(markdownDir, relativeFilePath)
    return stdoutToComments(filePath)
      .then(code => {
        return Promise.resolve(
          jsToMarkdown(
            updateRequires(
              code.trim(),
              path.dirname(filePath)
            )
          ))
      })
  }

  example.es6 = function (relativeFilePath) {
    return new Promise((resolve, reject) => {
      const es5FilePath = relativeFilePath + 'es5.js'
      return rollup.rollup({
        entry: path.resolve(markdownDir, relativeFilePath),
        plugins: [
          includePaths({
            paths: [markdownDir],
          }),
          babel({
            exclude: 'node_modules/**',
          }),
        ],
      })
      .then(bundle => bundle.write({
        format: 'cjs',
        sourceMap: true,
        dest: path.resolve(markdownDir, es5FilePath),
      }))
      .then(() => example(es5FilePath))
      .then(md => {
        cleanUp()
        resolve(md)
      })
      .catch(err => {
        cleanUp()
        reject(err)
      })

      function cleanUp () {
        try {
          fs.unlinkSync(path.resolve(markdownDir, es5FilePath))
          fs.unlinkSync(path.resolve(markdownDir, es5FilePath + '.map'))
        } catch (err) {
          console.log(err)
        }
      }
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
