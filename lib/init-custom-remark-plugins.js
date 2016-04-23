'use strict'
module.exports = initCusomtRemarkPlugins

const path = require('path')
const fileExists = require('file-exists')

function initCusomtRemarkPlugins (remark, opts) {
  opts = opts || {}
  const cwd = opts.cwd || process.cwd()
  const mosfilePath = path.resolve(cwd, 'mosfile.js')
  if (fileExists(mosfilePath)) {
    const mosfile = require(mosfilePath)
    if (mosfile.configureRemark) {
      mosfile.configureRemark(remark)
    }
  }
  return remark
}
