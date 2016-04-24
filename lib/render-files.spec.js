'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const renderFiles = require('./render-files')
const path = require('path')

describe('render-files', () => {
  it('should render files by pattern', done => {
    renderFiles({
      pattern: path.join(__dirname, '/test-cli/*.md'),
      processor: {
        process: () => Promise.resolve(),
      },
      afterEachRender: () => {},
      ignorePattern: 'ignore_this_path',
    })
    .then(() => done())
    .catch(done)
  })
})
