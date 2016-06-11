import {describe, it} from 'mocha'
import {expect} from 'chai'
import createSnippetRenderer from './create-snippet-renderer'
import path from 'path'

describe('createSnippetRenderer', () => {
  const snippet = createSnippetRenderer({
    filePath: path.resolve(__dirname, './test/EMPTY.md'),
  })

  it('should get snippet from existing js file', () => {
    return snippet('./file-1.js#foo')
      .then(md => expect(md).to.eq([
        '``` js',
        "console.log('foo')",
        "console.log('bar')",
        '```',
      ].join('\n')))
  })

  it('should get snippet from existing css file', () => {
    return snippet('./file-2.css#bar')
      .then(md => expect(md).to.eq([
        '``` css',
        '#bar {',
        '  color: red;',
        '}',
        '```',
      ].join('\n')))
  })

  it('should get snippet from existing html file', () => {
    return snippet('./file-3.html#span')
      .then(md => expect(md).to.eq([
        '``` html',
        '  <span>',
        '  </span>',
        '```',
      ].join('\n')))
  })

  it('should get snippet from existing md file', () => {
    return snippet('./file-4.md#bar')
      .then(md => expect(md).to.eq([
        '``` md',
        'bar',
        '```',
      ].join('\n')))
  })

  it('should get snippet from existing js file and add link to the source', () => {
    return snippet('./file-1.js#foo', { showSource: true })
      .then(md => expect(md).to.eq([
        '``` js',
        "console.log('foo')",
        "console.log('bar')",
        '```',
        '> Excerpt from [./file-1.js](./file-1.js#L8-L9)',
      ].join('\n')))
  })

  it('should throw error when file not found', done => {
    snippet('./no-file.js#foo')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        done()
      })
  })

  it('should throw error when anchor not found', done => {
    snippet('./file-1.js#not-found')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        expect(err.message).to.eq("Couldn't find anchor #not-found")
        done()
      })
  })

  it('should load the whole file when no anchor specified', () => {
    return snippet('./file-1.js')
      .then(md => expect(md).to.eq([
        '``` js',
        "'use strict'",
        '',
        'console.log(1)',
        'console.log(1)',
        'console.log(1)',
        'console.log(1)',
        '// #foo',
        "console.log('foo')",
        "console.log('bar')",
        '// #',
        'console.log(2)',
        'console.log(2)',
        'console.log(2)',
        '```',
      ].join('\n')))
  })

  it('should load the whole file when no anchor specified and add source footer', () => {
    return snippet('./file-1.js', { showSource: true })
      .then(md => expect(md).to.eq([
        '``` js',
        "'use strict'",
        '',
        'console.log(1)',
        'console.log(1)',
        'console.log(1)',
        'console.log(1)',
        '// #foo',
        "console.log('foo')",
        "console.log('bar')",
        '// #',
        'console.log(2)',
        'console.log(2)',
        'console.log(2)',
        '```',
        '> File [./file-1.js](./file-1.js)',
      ].join('\n')))
  })

  it('should get snippet from beginning of file and add source', () => {
    return snippet('./file-5.md#bar', { showSource: true })
      .then(md => expect(md).to.eq([
        '``` md',
        'bar',
        '```',
        '> Excerpt from [./file-5.md](./file-5.md#L2-L2)',
      ].join('\n')))
  })
})
