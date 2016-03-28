'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createInstallation = require('./create-installation')

describe('createInstallation', () => {
  it('should create installation section for global package', () => {
    const pkg = {
      name: 'foo',
      preferGlobal: 'MIT',
    }
    const installation = createInstallation(pkg)
    expect(installation).to.eq([
      '## Installation',
      '',
      'This module is installed via npm:',
      '',
      '``` sh',
      'npm install foo --global',
      '```',
    ].join('\n'))
  })

  it('should create installation section for local package', () => {
    const pkg = {
      name: 'foo',
    }
    const installation = createInstallation(pkg)
    expect(installation).to.eq([
      '## Installation',
      '',
      'This module is installed via npm:',
      '',
      '``` sh',
      'npm install foo --save',
      '```',
    ].join('\n'))
  })

  it('should throw exception for private package', () => {
    const pkg = {
      name: 'foo',
      private: true,
    }
    expect(() => createInstallation(pkg)).to.throw(Error, 'Cannot generate installation section for a private module')
  })
})
