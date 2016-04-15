'use strict'
module.exports = plugin

const renderLicense = require('./lib/render-license')

function plugin (markdown) {
  return {
    license: () => renderLicense(markdown),
  }
}
