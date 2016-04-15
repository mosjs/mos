'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const mosPluginShields = require('.')

describe('mosPluginShields', () => {
  it('should throw error when package hosted not on GitHub', () => {
    expect(() => mosPluginShields({ repo: { host: 'gitlab' } }))
      .to.throw(Error, 'The shields plugin only works for github repos')
  })
})
