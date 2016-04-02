'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const path = require('path')

const getShieldOpts = require('./get-shield-opts')

describe('get-shield-opts', () => {
  it.skip('should return case-sensitive repo slug', () => {
    return getShieldOpts({
      filePath: path.resolve(__dirname, './test/case-sensitive/README.md'),
    })
    .then(opts => {
      expect(opts.github.user).to.eq('SomE')
      expect(opts.github.repo).to.eq('RePo')
    })
  })

  it('should throw error when package hosted not on GitHub', done => {
    return getShieldOpts({
      filePath: path.resolve(__dirname, './test/not-github/README.md'),
    })
    .catch(err => {
      expect(err).to.be.instanceOf(Error)
      expect(err.message).to.eq('The shields plugin only works for github repos')
      done()
    })
  })
})
