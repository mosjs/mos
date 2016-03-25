'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const initPlugins = require('./init-plugins')

describe('initPlugins', () => {
  it('should init sync and async plugins', () => {
    function syncPlugin (opts) {
      return { foo: 'foo' }
    }

    function asyncPlugin (opts) {
      return Promise.resolve({ bar: 'bar' })
    }

    return initPlugins([syncPlugin, asyncPlugin], {})
      .then(scope => {
        expect(scope).to.eql({
          foo: 'foo',
          bar: 'bar',
        })
      })
  })
})
