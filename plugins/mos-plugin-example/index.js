'use strict'
module.exports = createPlugin

const createExample = require('./lib/create-example')

function createPlugin (opts) {
  return {
    example: createExample(opts),
  }
}
