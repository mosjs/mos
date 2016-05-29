import updateNotifier from 'update-notifier'
import meow from 'meow'
import processFiles from './process-files'
import normalizeNewline from 'normalize-newline'
import relative from 'relative'
import normalizePath from 'normalize-path'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import test from 'tape'
import tapDiff from '@zkochan/tap-diff'
import readPkgUp from '@zkochan/read-pkg-up'
import rcfile from 'rcfile'
import mos from 'mos-processor'
import defaultPlugins from './default-plugins'
import resolve from 'resolve'

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
} else {
  const highlightPath = chalk.bgBlack.yellow

  const isTest = ~['test', 't'].indexOf((cli.input[0] || '').toLowerCase())

  const processMD = md => readPkgUp({ cwd: md.filePath })
    .then(result => {
      const pkg = result.pkg
      const config = rcfile('mos', { cwd: path.dirname(md.filePath) })
      const allDeps = new Set([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ])

      const pkgPlugins = (config.plugins || [])
        .map(plugin => plugin instanceof Array
          ? { name: plugin[0], options: plugin[1] || {} }
          : { name: plugin, options: {} }
        )
        .map(plugin => {
          const namespacedName = 'mos-plugin-' + plugin.name
          if (allDeps.has(namespacedName)) {
            return {...plugin, name: namespacedName}
          }
          if (allDeps.has(plugin.name)) {
            return plugin
          }
          throw new Error(`${plugin.name} is not in the dependencies`)
        })
        .map(plugin => ({...plugin, path: resolve.sync(plugin.name, { basedir: path.dirname(md.filePath) })}))
        .map(plugin => ({...plugin, path: normalizePath(plugin.path)}))
        .map(plugin => ({...plugin, register: require(plugin.path)}))

      const defaultPluginsWithOpts = defaultPlugins.reduce((defPlugins, defPlugin) => {
        const defPluginName = defPlugin.attributes.pkg && defPlugin.attributes.pkg.name || defPlugin.attributes.name
        const options = config[defPluginName] || config[defPluginName.replace(/^mos-plugin-/, '')]
        if (options === false) {
          return defPlugins
        }
        return [
          ...defPlugins,
          {
            register: defPlugin,
            options: options,
          },
        ]
      }, [])

      return mos(md, [...defaultPluginsWithOpts, ...pkgPlugins])
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
  } else {
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
  }
}

function getRelativePath (filePath) {
  return relative(cwd, filePath)
}
