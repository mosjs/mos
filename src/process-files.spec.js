import {describe, it} from 'mocha'

import processFiles from './process-files'
import path from 'path'
import Promise from 'core-js/es6/promise'

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
