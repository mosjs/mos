#!/usr/bin/env node
'use strict'
const meow = require('meow')
const renderFiles = require('./render-files')
const normalizeNewline = require('normalize-newline')
const relative = require('relative')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const test = require('tape')

const cli = meow([
  'Usage',
  '  mos [test] [files]',
  '',
  'Options',
  ' --help, -h         Display usage',
  ' --version, -v      Display version',
  '',
  'Examples',
  '  mos',
  '  mos test',
  '  mos test README.md',
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

const isTest = ~['test', 't'].indexOf((cli.input[0] || '').toLowerCase())

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
const files = cli.input[isTest ? 1 : 0]
const pattern = files
  ? path.resolve(cwd, files)
  : path.resolve(cwd, '{/**/,/}*.{' + mdExtensions.join() + '}')

if (isTest) {
  test('markdown', t => {
    renderFiles({
      plugins,
      pattern,
      afterEachRender (opts) {
        const relativePath = getRelativePath(opts.filePath)
        t.equal(normalizeNewline(opts.newMD), normalizeNewline(opts.currentMD), relativePath)
      },
    })
    .then(() => t.end())
    .catch(err => { throw err })
  })
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
