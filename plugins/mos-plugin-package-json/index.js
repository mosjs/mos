'use strict'
module.exports = plugin

function plugin (markdown) {
  return {
    package: markdown.pkg,
  }
}
