'use strict'
module.exports = plugin

const getShieldOpts = require('./lib/get-shield-opts')
const createShieldsRenderer = require('./lib/create-shields-renderer')

function plugin (markdown) {
  return getShieldOpts(markdown)
    .then(opts => Promise.resolve({
      shields: createShieldsRenderer(opts),
    }))
}
