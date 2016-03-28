#!/usr/bin/env node
'use strict'
const meow = require('meow')
const renderFiles = require('./render-files')
const normalizeNewline = require('normalize-newline')
const relative = require('relative')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

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

const plugins = [
  require('../plugins/mos-plugin-package-json'),
  require('../plugins/mos-plugin-installation'),
  require('../plugins/mos-plugin-license'),
  require('../plugins/mos-plugin-shields'),
  require('../plugins/mos-plugin-example'),
  require('../plugins/mos-plugin-dependencies'),
]

const cwd = process.cwd()
const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
const pattern = path.resolve(cwd, '{/**/,/}*.{' + mdExtensions.join() + '}')

if (~['test', 't'].indexOf((cli.input[0] || '').toLowerCase())) {
  renderFiles({
    plugins,
    pattern,
    afterEachRender (opts) {
      if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
        const relativePath = getRelativePath(opts.filePath)
        console.log(highlightPath(relativePath), 'is not up to date!')
        process.exit(1)
      }
    },
  })
  .catch(err => { throw err })
} else {
  renderFiles({
    plugins,
    pattern,
    afterEachRender (opts) {
      if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
        fs.writeFileSync(opts.filePath, opts.newMD, {
          encoding: 'utf8',
        })
        const relativePath = getRelativePath(opts.filePath)
        console.log('updated', highlightPath(relativePath))
      }
    },
  })
  .catch(err => { throw err })
}

function getRelativePath (filePath) {
  return relative(process.cwd(), filePath)
}
