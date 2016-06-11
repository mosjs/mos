'use strict'
module.exports = plugin

const createExampleRenderer = require('./create-example-renderer')

function plugin (mos, markdown) {
  mos.scope.example = createExampleRenderer(markdown)
}

plugin.attributes = {
  pkg: require('../package.json'),
}
