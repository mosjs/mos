import {expect} from 'chai'
import path from 'path'

import getMarkdownMeta from './index'

describe('getMarkdownMeta', () => {
  it('should return case-sensitive repo slug', () => {
    return getMarkdownMeta(path.resolve(__dirname, '../../../test/fixtures/case-sensitive/README.md'))
      .then(opts => {
        expect(opts.repo.user).to.eq('SomE')
        expect(opts.repo.repo).to.eq('RePo')
      })
  })

  it('should return markdown meta', () => {
    const filePath = path.resolve(__dirname, '../../../test/fixtures/package/README.md')
    return getMarkdownMeta(filePath)
      .then(opts => {
        expect(opts.pkg.name).to.eq('foo')
        expect(opts.pkgRoot).to.match(/test\/fixtures\/package/)
        expect(opts.filePath).to.eq(filePath)
        expect(opts.repo.user).to.eq('foo')
        expect(opts.repo.repo).to.eq('bar')
      })
  })
})
