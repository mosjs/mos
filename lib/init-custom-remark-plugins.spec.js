'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const path = require('path')
const initCustomRemarkPlugins = require('./init-custom-remark-plugins')

describe('initCustomRemarkPlugins', () => {
  it('should use plugins registered via mosfile', done => {
    const remark = {
      use (plugin) {
        expect(plugin).to.eq('foo')
        done()
      },
    }
    initCustomRemarkPlugins(remark, {
      cwd: path.resolve(__dirname, 'test-mosfile'),
    })
  })
})
