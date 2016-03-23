'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const automd = require('./automd')

describe('automd', () => {
  it('should insert value to README when no value in the placeholder', () => {
    const processMarkup = automd({
      package: {
        name: 'foo',
      },
    })
    return processMarkup('Insert <!--@package.name--><!--/@--> here')
      .then(newReadme => {
        expect(newReadme).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value to README when the plugin returns a promise', () => {
    const processMarkup = automd({
      asyncFoo: () => Promise.resolve('foo'),
    })
    return processMarkup('Insert <!--@asyncFoo()--><!--/@--> here')
      .then(newReadme => {
        expect(newReadme).to.eq('Insert <!--@asyncFoo()-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value to README when already a value in the placeholder', () => {
    const processMarkup = automd({
      package: {
        name: 'foo',
      },
    })
    return processMarkup('Insert <!--@package.name-->bar<!--/@--> here')
      .then(newReadme => {
        expect(newReadme).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here')
      })
  })

  it('should insert value with newline to README', () => {
    const processMarkup = automd({
      package: {
        name: 'new\nvalue',
      },
    })
    return processMarkup('Insert <!--@package.name-->old\nvalue<!--/@--> here')
      .then(newReadme => {
        expect(newReadme).to.eq('Insert <!--@package.name-->\nnew\nvalue\n<!--/@--> here')
      })
  })

  it('should execute javascript and insert into the markup', () => {
    const processMarkup = automd()
    return processMarkup('Insert <!--@ 1 + 2 --><!--/@--> here')
      .then(newReadme => expect(newReadme).to.eq('Insert <!--@ 1 + 2 -->\n3\n<!--/@--> here'))
  })

  it('should execute javascript when it contains newlines', () => {
    const processMarkup = automd()
    return processMarkup('Insert <!--@\n\n1 + 2 --><!--/@--> here')
      .then(newReadme => expect(newReadme).to.eq('Insert <!--@\n\n1 + 2 -->\n3\n<!--/@--> here'))
  })

  it('should match several inputs', () => {
    const processMarkup = automd()
    return processMarkup('Insert <!--@\n\n1 + 2 --><!--/@--> here<!--@"Hello world!"-->"Hello world!"<!--/@-->')
      .then(newReadme => expect(newReadme).to.eq('Insert <!--@\n\n1 + 2 -->\n3\n<!--/@--> here<!--@"Hello world!"-->\nHello world!\n<!--/@-->'))
  })
})
