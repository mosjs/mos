'use strict'
module.exports = mdRenderer

const runAsync = require('run-async')
const asyncReplace = require('@zkochan/async-replace')

const regexp = new RegExp('<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--\/@-->', 'gm')

function mdRenderer (scope) {
  const mdVarNames = []
  const mdVarValues = []

  Object.keys(scope || {})
    .map(scopeVarName => {
      mdVarNames.push(scopeVarName)
      mdVarValues.push(scope[scopeVarName])
    })

  const exec = runAsync(code => {
    const funcBody = `return (${code})`
    return Function.apply(null, mdVarNames.concat(funcBody)).apply(null, mdVarValues)
  })

  return md => asyncReplace(md, regexp, (match, code, offset) => {
    if (hasOpenCodeBlock(md.slice(0, offset))) {
      return match
    }

    return exec(code).then(body => createInsertBlock(code, body))
  })

  function hasOpenCodeBlock (md) {
    const codeBlockBorders = md.match(/```/gm)
    return codeBlockBorders && codeBlockBorders.length % 2 !== 0
  }
}

function createInsertBlock (code, body) {
  const bodyWithNL = body ? `\n${body}\n` : body
  return `<!--@${code}-->${bodyWithNL}<!--/@-->`
}
