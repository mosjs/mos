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

  it('should throw error if the scope variable is a reserved word', done => {
    createMDScope([() => ({ delete: 1 })], {})
      .catch(err => {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.eq("Cannot make 'delete' a scope variable because it is a reserved word")
        done()
      })
  })
})
