'use strict'
var fs = require('fs')
var path = require('path')
var childProcess = require('child_process')
var argv = require('the-argv')
var readPkgUp = require('read-pkg-up')
var writePkg = require('write-pkg')
var arrExclude = require('arr-exclude')
var Promise = require('core-js/es6/promise')
var DEFAULT_TEST_SCRIPT = 'echo "Error: no test specified" && exit 1'

module.exports = function (opts) {
  opts = opts || {}

  var ret = readPkgUp.sync({
    cwd: opts.cwd,
    normalize: false,
  })
  var pkg = ret.pkg || {}
  var pkgPath = ret.path || path.resolve(opts.cwd || '', 'package.json')
  var cli = opts.args || argv()
  var args = arrExclude(cli, ['--init', '--unicorn'])
  var cmd = 'mos' + (args.length > 0 ? ' ' + args.join(' ') : '')
  var s = pkg.scripts = pkg.scripts ? pkg.scripts : {}

  if (s.test && s.test !== DEFAULT_TEST_SCRIPT) {
    s.test = s.test.replace(/\bnode (test\/)?test\.js\b/, cmd)

    if (!/\bmos\b/.test(s.test)) {
      s.test += ' && ' + cmd
    }
  } else {
    s.test = cmd
  }
  s.md = 'mos'
  s['?md'] = 'echo "Update the markdown files"'

  writePkg.sync(pkgPath, pkg)

  var post = function () {
    // for personal use
    if (cli.indexOf('--unicorn') !== -1) {
      var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      pkg.devDependencies.mos = '*'
      writePkg.sync(pkgPath, pkg)
    }
  }

  if (opts.skipInstall) {
    post()
    return Promise.resolve()
  }

  var child = childProcess.spawn('npm', ['install', '--save-dev', 'mos'], {
    cwd: path.dirname(pkgPath),
    stdio: 'inherit',
  })

  return new Promise(function (resolve, reject) {
    child.on('error', reject)
    child.on('exit', function (code) {
      if (code) {
        reject(new Error('npm command exited with non-zero exit code'))
      }
      post()
      resolve()
    })
  })
}
