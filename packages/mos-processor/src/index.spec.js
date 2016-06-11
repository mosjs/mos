import {describe, it} from 'mocha'
import {expect} from 'chai'
import m from 'markdownscript'
import mos from './index'
import * as plugiator from 'plugiator'

describe('mos', () => {
  describe.skip('use', () => {
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

  it.skip('should process AST', done => {
    const ast = m('markdownScript', { code: 'foo' }, [])
    const processor = mos()
    return processor
      .register([
        plugiator.anonymous(mos => mos.extendScope(md => ({ foo: 'foo' }))),
      ])
      .then(() => processor.process(ast, {filePath: __filename}))
      .then(newmd => {
        expect(newmd).to.eq('<!--@foo-->\nfoo\n<!--/@-->')
        done()
      })
      .catch(done)
  })

  it('should pass plugin options to the plugin', done => {
    return mos({}, [{
      register: plugiator.anonymous((mos, md) => {
        expect(md.options).to.eq('foo')
        done()
      }),
      options: 'foo',
    }]).catch(done)
  })

  it('should pass default plugin options to the plugin when none passed', done => {
    return mos({}, [
      plugiator.anonymous((mos, md) => {
        expect(md.options).to.eql({})
        done()
      }),
    ]).catch(done)
  })
})
