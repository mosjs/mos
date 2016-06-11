#!/usr/bin/env node
'use strict'
var loudRejection = require('loud-rejection')
loudRejection()

var resolve = require('resolve')
var cwd = process.cwd()

var localCLI
try {
  localCLI = resolve.sync('mos/bin/mos', { basedir: cwd })
} catch (err) {
  localCLI = __filename
}

if (localCLI && localCLI !== __filename) {
  console.log('Using local install of mos')
  require(localCLI)
} else {
  require('../dist/cli')
}
