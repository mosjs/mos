'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

import mosPluginShields from './index'

describe('mosPluginShields', () => {
  it('should throw error when package hosted not on GitHub', () => {
    expect(() => mosPluginShields({}, { repo: { host: 'gitlab' } }))
      .to.throw(Error, 'The shields plugin only works for github repos')
  })
})
