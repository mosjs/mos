'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createExample = require('./create-example')
const path = require('path')

describe('createExample', () => {
  const example = createExample({
    filePath: path.resolve(__dirname, './README.md'),
    pkg: {},
    pkgRoot: path.resolve('../', __dirname),
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

  it('should write importand single line comments outside code blocks', () => {
    return example('./test/important-single-line-comment.js')
      .then(actual => {
        expect(actual).to.eq([
          '``` js',
          'function repeatText (text, times) {',
          '  return Array(times).fill(text).join(\'\')',
          '}',
          '```',
          '',
          'This is an important comment',
          '',
          '``` js',
          'console.log(repeatText(\'foo\', 3))',
          '//> foofoofoo',
          '```',
        ].join('\n'))
      })
  })

  it('should write importand multiline comments outside code blocks', () => {
    return example('./test/important-multiline-comment.js')
      .then(actual => {
        expect(actual).to.eq([
          '``` js',
          'function repeatText (text, times) {',
          '  return Array(times).fill(text).join(\'\')',
          '}',
          '```',
          '',
          'This is an important comment',
          'and it is on multiple lines!',
          '',
          '``` js',
          'console.log(repeatText(\'foo\', 3))',
          '//> foofoofoo',
          '```',
        ].join('\n'))
      })
  })

  it('should replace relative require path with package name', () => {
    const example = createExample({
      filePath: path.resolve(__dirname, './README.md'),
      pkg: require('./test/require-example/package.json'),
      pkgRoot: path.resolve(__dirname, './test/require-example'),
    })

    return example('./test/require-example/example.js')
      .then(actual => {
        expect(actual).to.eq([
          '``` js',
          '\'use strict\'',
          'const fooBar = require(\'foo-bar\')',
          'console.log(fooBar)',
          '//> Hello world!',
          '```',
        ].join('\n'))
      })
  })
})
