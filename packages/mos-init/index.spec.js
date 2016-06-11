'use strict'
var describe = require('mocha').describe
var it = require('mocha').it
var expect = require('chai').expect
var path = require('path')
var fs = require('fs')
var dotProp = require('dot-prop')
var tempWrite = require('temp-write')
var mosInit = require('./')

var originalArgv = process.argv.slice()
var get = dotProp.get

function run (pkg) {
  var filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json')

  return mosInit({
    cwd: path.dirname(filepath),
    skipInstall: true,
  }).then(function () { return JSON.parse(fs.readFileSync(filepath, 'utf8')) })
}

describe('mos-init', function () {
  it('empty package.json', function () {
    process.argv = ['mos', '--init']
    return run({}).then(function (pkg) {
      expect(get(pkg, 'scripts.test')).to.eq('mos')
    })
  })

  it('has scripts', function () {
    process.argv = ['mos', '--init']
    return run({
      scripts: {
        start: '',
      },
    }).then(function (pkg) {
      expect(get(pkg, 'scripts.test'), 'mos')
    })
  })

  it('has default test', function () {
    process.argv = ['mos', '--init']
    return run({
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
    }).then(function (pkg) {
      expect(get(pkg, 'scripts.test'), 'mos')
    })
  })

  it('has only mos', function () {
    process.argv = ['mos', '--init']
    return run({
      scripts: {
        test: 'mos',
      },
    }).then(function (pkg) {
      expect(get(pkg, 'scripts.test')).to.eq('mos')
    })
  })

  it('has test', function () {
    process.argv = ['mos', '--init']
    return run({
      scripts: {
        test: 'foo',
      },
    }).then(function (pkg) {
      expect(get(pkg, 'scripts.test')).to.eq('foo && mos')
    })
  })

  it('has cli args', function () {
    process.argv = ['mos', '--init', '--foo']

    return run({
      scripts: {
        start: '',
      },
    }).then(function (pkg) {
      process.argv = originalArgv
      expect(get(pkg, 'scripts.test')).to.eq('mos --foo')
    })
  })

  it('has cli args and existing binary', function () {
    process.argv = ['mos', '--init', '--foo', '--bar']

    return run({
      scripts: {
        test: 'foo',
      },
    }).then(function (pkg) {
      process.argv = originalArgv
      expect(get(pkg, 'scripts.test')).to.eq('foo && mos --foo --bar')
    })
  })

  it('installs the mos dependency', function () {
    this.timeout(12e4)
    var filepath = tempWrite.sync(JSON.stringify({}), 'package.json')

    return mosInit({
      cwd: path.dirname(filepath),
    }).then(function () {
      expect(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.mos')).to.be.truthy
    })
  })
})
