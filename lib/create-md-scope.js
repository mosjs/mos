'use strict'
module.exports = createMDScope

const runAsync = require('run-async')

function createMDScope (plugins, opts) {
  return Promise.all(
      plugins
        .map(plugin => runAsync(plugin))
        .map(plugin => plugin(opts))
    )
    .then(scopes => {
      return Promise.resolve(
        scopes.reduce(
          (scope, pluginScope) => Object.assign(scope, pluginScope), {})
        )
    })
}
