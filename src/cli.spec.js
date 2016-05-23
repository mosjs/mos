'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const execa = require('execa')
const pkg = require('../package.json')
const path = require('path')
const cli = path.resolve(__dirname, '../bin/mos.js')
const testcwd = path.resolve(__dirname, 'test-cli')
global.Promise = require('core-js/es6/promise')

describe('cli', () => {
  it('show version', () => {
    return execa(cli, ['--version'])
      .then(result => expect(result.stdout).to.eq(pkg.version))
  })

  it('show version, shortcut', () => {
    return execa(cli, ['-v'])
      .then(result => expect(result.stdout).to.eq(pkg.version))
  })

  describe('test', () => {
    it('should pass markdown that is up to date', () => {
      return execa(cli, ['test', 'up-to-date.md', '--tap'], {
        cwd: testcwd,
      })
        .then(result => expect(result.stdout).to.eq([
          'TAP version 13',
          '# markdown',
          'ok 1 up-to-date.md',
          '',
          '1..1',
          '# tests 1',
          '# pass  1',
          '',
          '# ok',
          '',
        ].join('\n')))
    })

    it('should fail markdown that is not up to date', () => {
      return execa(cli, ['test', 'not-up-to-date.md', '--tap'], {
        cwd: testcwd,
      })
        .catch(result => {
          expect(result.stdout).to.have.string([
            'TAP version 13',
            '# markdown',
            'not ok 1 not-up-to-date.md',
            '  ---',
            '    operator: equal',
            '    expected: |-',
            "      '<!--@\\'# \\' + pkg.name-->\\n# Bad title\\n<!--/@-->\\n\\nContent\\n'",
            '    actual: |-',
            "      '<!--@\\'# \\' + pkg.name-->\\n# slipsum-lite\\n<!--/@-->\\n\\nContent\\n'",
          ].join('\n'))

          expect(result.stdout).to.have.string([
            '  ...',
            '',
            '1..1',
            '# tests 1',
            '# pass  0',
            '# fail  1\n\n',
          ].join('\n'))
        })
    })

    it('should use custom options for third-party plugins', () => {
      return execa(cli, ['test', 'plugin-options.md', '--tap'], {
        cwd: testcwd,
      })
        .then(result => expect(result.stdout).to.eq([
          'TAP version 13',
          '# markdown',
          'ok 1 plugin-options.md',
          '',
          '1..1',
          '# tests 1',
          '# pass  1',
          '',
          '# ok',
          '',
        ].join('\n')))
    })

    it('should disable default plugin', () => {
      return execa(cli, ['test', 'disable-default-plugin.md', '--tap'], {
        cwd: testcwd,
      })
        .then(result => expect(result.stdout).to.eq([
          'TAP version 13',
          '# markdown',
          'ok 1 disable-default-plugin.md',
          '',
          '1..1',
          '# tests 1',
          '# pass  1',
          '',
          '# ok',
          '',
        ].join('\n')))
    })
  })
})
