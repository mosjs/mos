import {describe, it} from 'mocha'
import {expect} from 'chai'
import path from 'path'

import getMarkdownMeta from './index'

describe('getMarkdownMeta', () => {
  it('should return case-sensitive repo slug', () => {
    return getMarkdownMeta(path.resolve(__dirname, './test/case-sensitive/README.md'))
      .then(opts => {
        expect(opts.repo.user).to.eq('SomE')
        expect(opts.repo.repo).to.eq('RePo')
      })
  })

  it('should return markdown meta', () => {
    const filePath = path.resolve(__dirname, './test/package/README.md')
    return getMarkdownMeta(filePath)
      .then(opts => {
        expect(opts.pkg.name).to.eq('foo')
        expect(opts.pkgRoot).to.match(/test\/package/)
        expect(opts.filePath).to.eq(filePath)
        expect(opts.repo.user).to.eq('foo')
        expect(opts.repo.repo).to.eq('bar')
      })
  })
})
