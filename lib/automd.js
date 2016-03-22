'use strict'
const regexp = new RegExp(`<!--@([\\s\\S]+?)-->([\\s\\S]*?)<!--\/@-->`, 'gm')

function createInsertBlock (code, body) {
  return `<!--@${code}-->${body}<!--/@-->`
}

module.exports = automd

function automd (plugins) {
  const argNames = []
  const args = []

  Object.keys(plugins || {})
    .forEach(key => {
      argNames.push(key)
      args.push(plugins[key])
    })

  function exec (code) {
    const funcBody = 'return (' + code + ')'
    return Function.apply(null, argNames.concat(funcBody)).apply(null, args)
  }

  return processMarkup

  function processMarkup (text) {
    return text.replace(regexp, (match, code) => {
      return createInsertBlock(code, exec(code))
    })
  }
}
