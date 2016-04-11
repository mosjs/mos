'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createAsyncScopeEval = require('./create-async-scope-eval')

describe('createAsyncScopeEval', () => {
  it('should work with sync code', () => {
    return createAsyncScopeEval({ a: 1, b: 2 })('a + b')
      .then(result => expect(result).to.eq(3))
  })

  it('should work with async code', () => {
    return createAsyncScopeEval({ a: 1, b: 2 })('Promise.resolve(a + b)')
      .then(result => expect(result).to.eq(3))
  })
})
