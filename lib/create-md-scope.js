'use strict'
module.exports = createMDScope

const runAsync = require('run-async')

function createMDScope (plugins, markdown) {
  return Promise.all(
      plugins
        .map(plugin => runAsync(plugin))
        .map(plugin => plugin(markdown))
    )
    .then(scopes => scopes.reduce(
      (scope, pluginScope) => Object.assign(scope, pluginScope), {})
    )
}
