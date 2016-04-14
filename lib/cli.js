#!/usr/bin/env node
'use strict'
const meow = require('meow')
const renderFiles = require('./render-files')
const normalizeNewline = require('normalize-newline')
const relative = require('relative')
const normalizePath = require('normalize-path')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const test = require('tape')
const tapDiff = require('tap-diff')
const readPkgUp = require('read-pkg-up')
const resolve = require('resolve')

const cli = meow([
  'Usage',
  '  mos [test] [files]',
  '',
  'Options',
  ' --help, -h         Display usage',
  ' --version, -v      Display version',
  ' --tap              Generate TAP output when testing markdown files',
  '',
  ' -x="<exclude-pattern>"',
  '                    Exclude pattern',
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

const cwd = process.cwd()

readPkgUp({ cwd })
  .then(result => {
    const plugins = [
      require('../plugins/mos-plugin-package-json'),
      require('../plugins/mos-plugin-installation'),
      require('../plugins/mos-plugin-license'),
      require('../plugins/mos-plugin-shields'),
      require('../plugins/mos-plugin-example'),
      require('../plugins/mos-plugin-dependencies'),
      require('../plugins/mos-plugin-snippet'),
    ].concat(
       Object
        .keys(result.pkg.dependencies || {})
        .concat(Object.keys(result.pkg.devDependencies || {}))
        .filter(dep => dep.indexOf('mos-plugin-') === 0)
        .map(dep => resolve.sync(dep, { basedir: cwd }))
        .map(normalizePath)
        .map(require)
    )
    const mdExtensions = ['markdown', 'mdown', 'mkdn', 'mkd', 'md']
    const files = cli.input[isTest ? 1 : 0]
    const pattern = files
      ? path.resolve(cwd, files)
      : path.resolve(cwd, `{/**/,/}*.{${mdExtensions.join()}}`)
    const ignorePattern = cli.flags.x
      ? path.resolve(cwd, cli.flags.x)
      : null

    if (isTest) {
      if (cli.flags.tap !== true) {
        test.createStream()
          .pipe(tapDiff())
          .pipe(process.stdout)
      }
      test('markdown', t => {
        renderFiles({
          plugins,
          pattern,
          ignorePattern,
          afterEachRender (opts) {
            const relativePath = normalizePath(getRelativePath(opts.filePath))
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
        ignorePattern,
        afterEachRender (opts) {
          if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
            fs.writeFileSync(opts.filePath, opts.newMD, {
              encoding: 'utf8',
            })
            const relativePath = normalizePath(getRelativePath(opts.filePath))
            console.log('updated', highlightPath(relativePath))
          }
        },
      })
      .catch(err => { throw err })
    }
  })
  .catch(err => { throw err })

function getRelativePath (filePath) {
  return relative(cwd, filePath)
}
