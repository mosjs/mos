'use strict'
module.exports = plugin

const createSnippetRenderer = require('./lib/create-snippet-renderer')

function plugin (markdown) {
  return {
    snippet: createSnippetRenderer(markdown),
  }
}
