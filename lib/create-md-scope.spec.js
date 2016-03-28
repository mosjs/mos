'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createMDScope = require('./create-md-scope')

describe('createMDScope', () => {
  it('should init sync and async plugins', () => {
    function syncPlugin (opts) {
      return { foo: 'foo' }
    }

    function asyncPlugin (opts) {
      return Promise.resolve({ bar: 'bar' })
    }

    return createMDScope([syncPlugin, asyncPlugin], {})
      .then(scope => {
        expect(scope).to.eql({
          foo: 'foo',
          bar: 'bar',
        })
      })
  })
})
