'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const path = require('path')
const initCustomPlugins = require('./init-custom-plugins')

describe('initCustomPlugins', () => {
  it('should use plugins registered via mosfile', done => {
    const mos = {
      useRemarkPlugin (plugin) {
        expect(plugin).to.eq('foo')
        done()
      },
    }
    initCustomPlugins(mos, {
      cwd: path.resolve(__dirname, 'test-mosfile'),
    })
  })
})
