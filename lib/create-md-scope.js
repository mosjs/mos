'use strict'
module.exports = createMDScope

const runAsync = require('run-async')
const reserved = require('reserved-words')

function createMDScope (plugins, markdown) {
  return Promise.all(
      plugins
        .map(plugin => runAsync(plugin))
        .map(plugin => plugin(markdown))
    )
    .then(scopes => scopes.reduce(
      (scope, pluginScope) => {
        Object.keys(pluginScope).forEach(scopeVar => {
          if (reserved.check(scopeVar, 'next')) { // TODO: make it strict
            throw new Error(`Cannot make '${scopeVar}' a scope variable because it is a reserved word`)
          }
          scope[scopeVar] = pluginScope[scopeVar]
        })
        return scope
      }, {})
    )
}
