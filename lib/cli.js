'use strict'
const updateNotifier = require('update-notifier')
const meow = require('meow')
const processFiles = require('./process-files')
const normalizeNewline = require('normalize-newline')
const relative = require('relative')
const normalizePath = require('normalize-path')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const test = require('tape')
const tapDiff = require('@zkochan/tap-diff')
const readPkgUp = require('@zkochan/read-pkg-up')
const mos = require('mos-processor')
const defaultPlugins = require('./default-plugins')
const resolve = require('resolve')

const cwd = process.cwd()
const stdout = process.stdout

const cli = meow([
  'Usage',
  '  mos [test] [files]',
  '',
  'Options',
  ' --init             Add mos to your project',
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
  '  mos --init',
  '  mos --init README.md',
  '',
  'Tips:',
  '  Add `mos test` to your `scripts.test` property in `package.json`',
].join('\n'), {
  alias: {
    help: 'h',
    version: 'v',
  },
})

updateNotifier({pkg: cli.pkg}).notify()

if (cli.flags.init) {
  require('mos-init')()
  return // eslint-disable-line
}

const highlightPath = chalk.bgBlack.yellow

const isTest = ~['test', 't'].indexOf((cli.input[0] || '').toLowerCase())

const processMD = md => readPkgUp({ cwd: md.filePath })
  .then(result => {
    const allDeps = new Set(Object
      .keys(result.pkg.dependencies || {})
      .concat(Object.keys(result.pkg.devDependencies || {})))

    result.pkg.mos = result.pkg.mos || {}

    const pkgPlugins = (result.pkg.mos.plugins || [])
      .map(plugin => plugin instanceof Array
        ? { name: plugin[0], options: plugin[1] || {} }
        : { name: plugin, options: {}}
      )
      .map(plugin => {
        const namespacedName = 'mos-plugin-' + plugin.name
        if (allDeps.has(namespacedName)) {
          return Object.assign({}, plugin, {name: namespacedName})
        }
        if (allDeps.has(plugin.name)) {
          return plugin
        }
        throw new Error(`${plugin.name} is not in the dependencies`)
      })
      .map(plugin => Object.assign(plugin, {path: resolve.sync(plugin.name, { basedir: path.dirname(md.filePath) })}))
      .map(plugin => Object.assign(plugin, {path: normalizePath(plugin.path)}))
      .map(plugin => Object.assign(plugin, {register: require(plugin.path)}))

    const defaultPluginsWithOpts = defaultPlugins.map(defPlugin => {
      const defPluginName = defPlugin.attributes.pkg && defPlugin.attributes.pkg.name || defPlugin.attributes.name
      return {
        register: defPlugin,
        options: result.pkg.mos[defPluginName] || result.pkg.mos[defPluginName.replace(/^mos-plugin-/, '')] || {}
      }
    })

    return mos(md, defaultPluginsWithOpts.concat(pkgPlugins))
  })
  .then(processor => processor.process())

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
      .pipe(stdout)
  }
  test('markdown', t => {
    processFiles({
      process: processMD,
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
  return
}
processFiles({
  process: processMD,
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

function getRelativePath (filePath) {
  return relative(cwd, filePath)
}
