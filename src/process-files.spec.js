'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const processFiles = require('./process-files')
const path = require('path')
const Promise = require('core-js/es6/promise')

describe('render-files', () => {
  it('should render files by pattern', done => {
    processFiles({
      pattern: path.join(__dirname, '/test-cli/*.md'),
      process: () => Promise.resolve(),
      afterEachRender: () => {},
      ignorePattern: 'ignore_this_path',
    })
    .then(() => done())
    .catch(done)
  })
})
