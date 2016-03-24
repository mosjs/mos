#!/usr/bin/env node
'use strict'
const meow = require('meow')
const renderAll = require('./render-all')
const fs = require('fs')

const cli = meow([
  'Usage',
  '  mos [<test>]',
  '',
  'Options',
  ' --help, -h         Display usage',
  ' --version, -v      Display version',
  '',
  'Examples',
  '  mos',
  '  mos test',
  '',
  'Tips:',
  '  Add `mos test` to your `scripts.test` property in `package.json`',
].join('\n'), {
  alias: {
    help: 'h',
    version: 'v',
  },
})

if (~cli.input.indexOf('test')) {
  renderAll((opts) => {
    if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
      console.log(opts.filePath + ' is not up to date!')
      process.exit(1)
    }
  })
} else {
  renderAll((opts) => {
    fs.writeFileSync(opts.filePath, opts.newMD, {
      encoding: 'utf8',
    })
  })
}

function normalizeNewline (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }

  return str.replace(/\r\n/g, '\n').replace(/\n*$/, '')
}
