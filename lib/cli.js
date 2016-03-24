#!/usr/bin/env node
'use strict'
const meow = require('meow')
const renderAll = require('./render-all')
const normalizeNewline = require('normalize-newline')
const relative = require('relative')
const chalk = require('chalk')
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

const highlightPath = chalk.bgBlack.yellow

if (~['test', 't'].indexOf((cli.input[0] || '').toLowerCase())) {
  renderAll((opts) => {
    if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
      const relativePath = getRelativePath(opts.filePath)
      console.log(highlightPath(relativePath), 'is not up to date!')
      process.exit(1)
    }
  })
} else {
  renderAll((opts) => {
    if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
      fs.writeFileSync(opts.filePath, opts.newMD, {
        encoding: 'utf8',
      })
      const relativePath = getRelativePath(opts.filePath)
      console.log('updated', highlightPath(relativePath))
    }
  })
}

function getRelativePath (filePath) {
  return relative(process.cwd(), filePath)
}
