'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const remark = require('remark')
const remarkMos = require('.')

function mdRenderer (scope) {
  const processor = remark().use(remarkMos, {scope})
  return md => new Promise((resolve, reject) =>
    processor.process(md, (err, newmd) => err
      ? reject(err)
      : resolve(processor.stringify(newmd, {
        listItemIndent: '1',
      }))
    )
  )
}

describe('mos', () => {
  it('should insert value to markdown when no value in the placeholder', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'foo',
      },
    })
    return renderMD('Insert <!--@package.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value to markdown when the plugin returns a promise', () => {
    const renderMD = mdRenderer({
      asyncFoo: () => Promise.resolve('foo'),
    })
    return renderMD('Insert <!--@asyncFoo()--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@asyncFoo()-->\nfoo\n<!--/@--> here\n')
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
        expect(newMD).to.eq('Insert <!--@package.name-->\nfoo\n<!--/@--> here\n')
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
        expect(newMD).to.eq('Insert <!--@package.name-->\nnew\nvalue\n<!--/@--> here\n')
      })
  })

  it('should execute javascript and insert into the markup', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert <!--@ 1 + 2 --><!--/@--> here')
      .then(newMD => expect(newMD).to.eq('Insert <!--@ 1 + 2 -->\n3\n<!--/@--> here\n'))
  })

  it('should execute javascript when it contains newlines', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n'))
  })

  it('should match several inputs', () => {
    const renderMD = mdRenderer()
    return renderMD('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere\n\n<!--@"Hello world!"-->"Hello world!"<!--/@-->\n')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n\n<!--@"Hello world!"-->\nHello world!\n<!--/@-->\n'))
  })

  it('should not insert value to markdown comments that are inside code blocks', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'foo',
      },
    })
    return renderMD('Do not insert\n``` md\n<!--@package.name--><!--/@-->\n```\nhere')
      .then(newMD => {
        expect(newMD).to.eq('Do not insert\n\n```md\n<!--@package.name--><!--/@-->\n```\n\nhere\n')
      })
  })

  it('should insert value to markdown when comments are after code blocks', () => {
    const renderMD = mdRenderer({
      package: {
        name: 'foo',
      },
    })
    return renderMD('```\nInsert\n```\n\n<!--@package.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('    Insert\n\n<!--@package.name-->\nfoo\n<!--/@-->\n\n here\n')
      })
  })

  it('should throw exception when error during template code execution', done => {
    const renderMD = mdRenderer()
    return renderMD('<!--@1/--><!--/@-->')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        expect(err.message).to.match(/Failed to execute template code at line 1/)
        done()
      })
  })
})
