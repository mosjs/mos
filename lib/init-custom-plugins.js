'use strict'
module.exports = initCusomtPlugins

const path = require('path')
const fileExists = require('file-exists')

function initCusomtPlugins (mos, opts) {
  opts = opts || {}
  const cwd = opts.cwd || process.cwd()
  const mosfilePath = path.resolve(cwd, 'mosfile.js')
  if (fileExists(mosfilePath)) {
    const mosfile = require(mosfilePath)
    if (mosfile) {
      mosfile(mos)
    }
  }
  return mos
}
