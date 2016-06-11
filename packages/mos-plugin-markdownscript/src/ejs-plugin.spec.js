import {describe, it} from 'mocha'
import {expect} from 'chai'

import markdownscriptPlugin from './ejs-plugin'

describe('mos-plugin-markdownscript', () => {
  it('should extend markdown scope with markdownscript helpers', () => {
    const scope = markdownscriptPlugin({})
    expect(scope.m).to.be.a('function')
    expect(scope.h1).to.be.a('function')
    expect(scope.blockquote).to.be.a('function')
  })
})
