'use strict'
module.exports = plugin

const renderDeps = require('./lib/render-deps')

function plugin (markdown) {
  return {
    dependencies: () => `## Dependencies\n\n${
      renderDeps({
        deps: markdown.pkg.dependencies,
        pkgRoot: markdown.pkgRoot,
      })
    }\n`,
    devDependencies: () => `## Dev Dependencies\n\n${
      renderDeps({
        deps: markdown.pkg.devDependencies,
        pkgRoot: markdown.pkgRoot,
      })
    }\n`,
  }
}
