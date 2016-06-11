'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
import createAsyncScopeEval from './create-async-scope-eval'

describe('createAsyncScopeEval', () => {
  it('should work with sync code', () => {
    return createAsyncScopeEval({ a: 1, b: 2 })('a + b')
      .then(result => expect(result).to.eq(3))
  })

  if (global.Promise) {
    it('should work with async code', () => {
      return createAsyncScopeEval({ a: 1, b: 2 })('Promise.resolve(a + b)')
        .then(result => expect(result).to.eq(3))
    })
  }

  it('should run in strict mode', done => {
    createAsyncScopeEval({}, { useStrict: true })('package')
      .catch(err => {
        expect(err).to.be.instanceof(SyntaxError)
        expect(err.message).to.eq('Unexpected strict mode reserved word')
        done()
      })
  })
})
