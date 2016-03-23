'use strict'
module.exports = automd

const runAsync = require('run-async')
const arr = require('async-regex-replace')

const regexp = new RegExp(`<!--@([\\s\\S]+?)-->([\\s\\S]*?)<!--\/@-->`, 'gm')

function createInsertBlock (code, body) {
  const bodyWithNL = body ? '\n' + body + '\n' : body
  return `<!--@${code}-->${bodyWithNL}<!--/@-->`
}

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
    return new Promise((resolve, reject) => {
      arr.replace(regexp, text, (matches, cb) => {
        const code = matches[1]
        runAsync(exec, (err, body) => {
          if (err) return cb(err)

          cb(null, createInsertBlock(code, body))
        })(code)
      }, (err, result) => err ? reject(err) : resolve(result))
    })
  }
}
