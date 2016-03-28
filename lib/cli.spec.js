'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const execa = require('execa')
const pkg = require('../package.json')
const path = require('path')
const cli = path.resolve(__dirname, './cli.js')

describe('cli', () => {
  it('show version', () => {
    return execa(cli, ['--version'])
      .then(result => expect(result.stdout).to.eq(pkg.version))
  })

  it('show version, shortcut', () => {
    return execa(cli, ['-v'])
      .then(result => expect(result.stdout).to.eq(pkg.version))
  })
})
