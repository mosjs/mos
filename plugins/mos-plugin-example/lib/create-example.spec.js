'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createExample = require('./create-example')
const path = require('path')

describe('createExample', () => {
  const example = createExample({
    filePath: path.resolve(__dirname, './README.md'),
  })

  it('should generate example from a file', () => {
    return example('./test/hello-world-example.js')
      .then(actual => {
        expect(actual).to.eq([
          '``` js',
          'console.log(\'Hello world!\')',
          '//> Hello world!',
          '```',
        ].join('\n'))
      })
  })
})
