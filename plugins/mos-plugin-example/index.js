'use strict'
module.exports = plugin

const createExampleRenderer = require('./lib/create-example-renderer')

function plugin (markdown) {
  return {
    example: createExampleRenderer(markdown),
  }
}
