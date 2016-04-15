'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const path = require('path')

const getMarkdownMeta = require('.')

describe('getMarkdownMeta', () => {
  it.skip('should return case-sensitive repo slug', () => {
    return getMarkdownMeta({
      filePath: path.resolve(__dirname, './test/case-sensitive/README.md'),
    })
    .then(opts => {
      expect(opts.repo.user).to.eq('SomE')
      expect(opts.repo.repo).to.eq('RePo')
    })
  })
})
