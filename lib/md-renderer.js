'use strict'
module.exports = mdRenderer

const runAsync = require('run-async')
const replaceAsync = require('@zkochan/async-regex-replace').replace

const regexp = new RegExp('<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--\/@-->', 'gm')

function mdRenderer (scope) {
  const mdVarNames = []
  const mdVarValues = []

  Object.keys(scope || {})
    .map(scopeVarName => {
      mdVarNames.push(scopeVarName)
      mdVarValues.push(scope[scopeVarName])
    })

  return renderMD

  function renderMD (md) {
    return new Promise((resolve, reject) => {
      replaceAsync(regexp, md, (match, code, offset, original, cb) => {
        const codeBlockBorders = md.slice(0, offset).match(/```/gm)

        if (codeBlockBorders && codeBlockBorders.length % 2 !== 0) {
          return cb(null, match)
        }

        runAsync(exec, (err, body) => {
          if (err) return cb(err)

          cb(null, createInsertBlock(code, body))
        })(code)
      }, (err, result) => err ? reject(err) : resolve(result))
    })
  }

  function exec (code) {
    const funcBody = 'return (' + code + ')'
    return Function.apply(null, mdVarNames.concat(funcBody)).apply(null, mdVarValues)
  }
}

function createInsertBlock (code, body) {
  const bodyWithNL = body ? '\n' + body + '\n' : body
  return `<!--@${code}-->${bodyWithNL}<!--/@-->`
}
