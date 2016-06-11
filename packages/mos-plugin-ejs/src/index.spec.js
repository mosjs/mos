'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const mos = require('mos-processor')
import plugin from './index'

function createProcess (scope) {
  const plugin1 = mos => Object.assign(mos.scope, scope || {})
  plugin1.attributes = {
    name: 'plugin1',
  }
  return md => {
    return mos({ content: md, filePath: __filename }, [plugin, plugin1])
      .then(processor => processor.process())
  }
}

describe('mos', () => {
  it('should insert value to markdown when no value in the placeholder', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('Insert <!--@pkg.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@pkg.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value to markdown when the plugin returns a promise', () => {
    const process = createProcess({
      asyncFoo: () => Promise.resolve('foo'),
    })
    return process('Insert <!--@asyncFoo()--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@asyncFoo()-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value to markdown when there is already a value in the placeholder', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('Insert <!--@pkg.name-->bar<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@pkg.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert value with newline to markdown', () => {
    const process = createProcess({
      pkg: {
        name: 'new\nvalue',
      },
    })
    return process('Insert <!--@pkg.name-->old\nvalue<!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@pkg.name-->\nnew\nvalue\n<!--/@--> here\n')
      })
  })

  it('should execute javascript and insert into the markup', () => {
    const process = createProcess()
    return process('Insert <!--@ 1 + 2 --><!--/@--> here')
      .then(newMD => expect(newMD).to.eq('Insert <!--@ 1 + 2 -->\n3\n<!--/@--> here\n'))
  })

  it('should execute javascript when it contains newlines', () => {
    const process = createProcess()
    return process('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n'))
  })

  it('should match several inputs', () => {
    const process = createProcess()
    return process('Insert\n\n<!--@\n\n1 + 2 --><!--/@-->\n\nhere\n\n<!--@"Hello world!"-->"Hello world!"<!--/@-->\n')
      .then(newMD => expect(newMD).to.eq('Insert\n\n<!--@\n\n1 + 2 -->\n3\n<!--/@-->\n\nhere\n\n<!--@"Hello world!"-->\nHello world!\n<!--/@-->\n'))
  })

  it('should not insert value to markdown comments that are inside code blocks', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('Do not insert\n``` md\n<!--@pkg.name--><!--/@-->\n```\nhere')
      .then(newMD => {
        expect(newMD).to.eq('Do not insert\n\n```md\n<!--@pkg.name--><!--/@-->\n```\n\nhere\n')
      })
  })

  it('should insert value to markdown when comments are after code blocks', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('```\nInsert\n```\n\n<!--@pkg.name--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('    Insert\n\n<!--@pkg.name-->\nfoo\n<!--/@-->\n\n here\n')
      })
  })

  it('should throw exception when error during template code execution', done => {
    const process = createProcess()
    return process('<!--@1/--><!--/@-->')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        expect(err.message).to.match(/Failed to execute template code at line 1/)
        done()
      })
  })

  it('should insert value to markdown and override nested markdown scripts', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('Insert <!--@pkg.name--><!--@pkg.name--><!--/@--><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@pkg.name-->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should ignore closing tag that is inside a fenced block', () => {
    const process = createProcess({
      pkg: {
        name: 'foo',
      },
    })
    return process('<!--@pkg.name-->\n```\n<!--/@-->\n```\n<!--/@-->')
      .then(newMD => {
        expect(newMD).to.eq('<!--@pkg.name-->\nfoo\n<!--/@-->\n')
      })
  })

  it('should insert value to markdown and override nested markdown scripts that are inside fenced blocks', () => {
    const process = createProcess()
    return process('<!--@"foo"-->\n```\n<!--@pkg.name--><!--/@-->\n```\n<!--/@-->')
      .then(newMD => {
        expect(newMD).to.eq('<!--@"foo"-->\nfoo\n<!--/@-->\n')
      })
  })

  it('should insert convert AST to markdown and insert it', () => {
    const process = createProcess({
      ast: {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'foo',
          },
        ],
      },
    })
    return process('Insert <!--@ ast --><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@ ast -->\nfoo\n<!--/@--> here\n')
      })
  })

  it('should insert additional break after list', () => {
    const process = createProcess({
      ast: {
        type: 'list',
        ordered: false,
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'text',
                value: 'foo',
              },
            ],
          },
        ],
      },
    })
    return process('Insert <!--@ ast --><!--/@--> here')
      .then(newMD => {
        expect(newMD).to.eq('Insert <!--@ ast -->\n- foo\n\n<!--/@--> here\n')
      })
  })

  describe('stringify', () => {
    it('should stringify markdownScript with no children', done => {
      return mos({}, [plugin])
        .then(processor => processor.compile({
          type: 'markdownScript',
          code: 'foo',
          children: [],
        }))
        .then(result => {
          expect(result).to.eq('<!--@foo--><!--/@-->')
          done()
        })
        .catch(done)
    })
  })
})
