'use strict'
module.exports = function removeLastEOL (text) {
  return text.replace(/\r?\n\s*$/, '')
}
