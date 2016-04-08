'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const jsToMarkdown = require('./js-to-markdown')

describe('jsToMarkdown', () => {
  it('should escape importand single line comment at the beginning', () => {
    const js = [
      '//! comment',
      '',
      'void 0',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('comment\n\n``` js\nvoid 0\n```')
  })

  it('should escape importand single line comment inside the code', () => {
    const js = [
      'void 0',
      '',
      '//! comment',
      '',
      'void 1',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('``` js\nvoid 0\n```\n\ncomment\n\n``` js\nvoid 1\n```')
  })

  it('should escape importand multiline comment inside the code', () => {
    const js = [
      'void 0',
      '',
      '/*! comment line #1',
      '    comment line #2 */',
      '',
      'void 1',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('``` js\nvoid 0\n```\n\ncomment line #1\n' +
      'comment line #2\n\n``` js\nvoid 1\n```')
  })

  it('should escape importand single line comment at the end', () => {
    const js = [
      'void 0',
      '',
      '//! comment',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('``` js\nvoid 0\n```\n\ncomment')
  })

  it('should escape several important comments', () => {
    const js = [
      '//! begining comment',
      'void 0',
      '',
      '//! comment',
      '',
      'void 1',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('begining comment\n\n``` js\nvoid 0\n```\n\ncomment\n\n``` js\nvoid 1\n```')
  })

  it('should escape and unite important comments that are near each other', () => {
    const js = [
      'void 0',
      '',
      '//! comment 1',
      '//! comment 2',
      '',
      'void 1',
    ].join('\n')

    const md = jsToMarkdown(js)

    expect(md).to.eq('``` js\nvoid 0\n```\n\ncomment 1\n\ncomment 2\n\n``` js\nvoid 1\n```')
  })
})
