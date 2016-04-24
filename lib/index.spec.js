'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
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
})
