'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const mdRenderer = require('./md-renderer')

describe('mdRenderer', () => {
  it('should insert value to markdown when no value in the placeholder', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'foo',
      },
    })
    return renderMD('Insert <!--@package.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value to markdown when the plugin returns a promise', () => {
    const renderMD = mdRenderer({
      asyncFoo: () => Promise.resolve('foo'),
    })
    return renderMD('Insert <!--@asyncFoo()--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@asyncFoo()-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value to markdown when there is already a value in the placeholder', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'foo',
      },
    })
    return renderMD('Insert <!--@package.name-->bar<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value with newline to markdown', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'new\nvalue',
      },
    })
    return renderMD('Insert <!--@package.name-->old\nvalue<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nnew\nvalue\n<!--/@--> here')
      })
  })

  it('should execute javascript and insert into the markup', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert <!--@ 1 + 2 --><!--/@--> here')
      .then(newMD => expect(newMD).to.eq('Insert <!--@ 1 + 2 -->\n3\n<!--/@--> here'))
  })

  it('should execute javascript when it contains newlines', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert <!--@\n\n1 + 2 --><!--/@--> here')
      .then(newMD => expect(newMD).to.eq('Insert <!--@\n\n1 + 2 -->\n3\n<!--/@--> here'))
  })

  it('should match several inputs', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert <!--@\n\n1 + 2 --><!--/@--> here<!--@"Hello world!"-->"Hello world!"<!--/@-->')
      .then(newMD => expect(newMD).to.eq('Insert <!--@\n\n1 + 2 -->\n3\n<!--/@--> here<!--@"Hello world!"-->\nHello world!\n<!--/@-->'))
  })
})
