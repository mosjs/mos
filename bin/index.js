#!/usr/bin/env node
'use strict'
const loudRejection = require('loud-rejection')
loudRejection()

const resolve = require('resolve')
const cwd = process.cwd()

let localCLI
try {
  localCLI = resolve.sync('mos/bin', { basedir: cwd })
} catch (err) {
  localCLI = __filename
}

if (localCLI && localCLI !== __filename) {
  console.log('Using local install of mos')
  require(localCLI)
  return // eslint-disable-line
}

require('../lib/cli')
