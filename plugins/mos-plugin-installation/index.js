'use strict'
module.exports = plugin

const renderInstallation = require('./lib/render-installation')

function plugin (markdown) {
  return {
    installation: () => renderInstallation(markdown),
  }
}
