'use strict'
module.exports = initPlugins

const runAsync = require('run-async')

function initPlugins (pluginCreators, opts) {
  return Promise.all(
      pluginCreators
        .map(createPlugin => runAsync(createPlugin))
        .map(createPlugin => createPlugin(opts))
    )
    .then((scopes) => {
      return Promise.resolve(
        scopes.reduce(
          (scope, pluginScope) => Object.assign(scope, pluginScope), {})
        )
    })
}
