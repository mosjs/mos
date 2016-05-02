'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const m = require('markdownscript')
const mos = require('.')

describe('mos', () => {
  describe('use', () => {
    it('should register mos plugin', done => {
      const processor = mos().use(md => ({ foo: 'foo' }))
      return processor.process('<!--@foo--><!--/@-->', {filePath: __filename})
        .then(newmd => {
          expect(newmd).to.eq('<!--@foo-->\nfoo\n<!--/@-->\n')
          done()
        })
        .catch(done)
    })
  })

  it('should process AST', done => {
    const ast = m('markdownScript', { code: 'foo' }, [])
    return mos()
      .use(md => ({ foo: 'foo' }))
      .process(ast, {filePath: __filename})
      .then(newmd => {
        expect(newmd).to.eq('<!--@foo-->\nfoo\n<!--/@-->')
        done()
      })
      .catch(done)
  })
})
