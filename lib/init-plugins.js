'use strict'
module.exports = initPlugins

const runAsync = require('run-async')

function initPlugins (plugins, opts) {
  return Promise.all(
      plugins
        .map(plugin => runAsync(plugin))
        .map(plugin => plugin(opts))
    )
    .then((scopes) => {
      return Promise.resolve(
        scopes.reduce(
          (scope, pluginScope) => Object.assign(scope, pluginScope), {})
        )
    })
}
