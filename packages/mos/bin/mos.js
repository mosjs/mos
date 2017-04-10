#!/usr/bin/env node
'use strict'
var loudRejection = require('loud-rejection')
loudRejection()

var resolveCwd = require('resolve-cwd')

var localCLI
try {
  localCLI = resolveCwd('mos/bin/mos')
} catch (err) {
  localCLI = __filename
}

if (localCLI && localCLI !== __filename) {
  console.log('Using local install of mos')
  require(localCLI)
} else {
  require('../dist/cli')
}
