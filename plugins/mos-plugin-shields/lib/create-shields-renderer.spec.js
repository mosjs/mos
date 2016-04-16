'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createShieldsRenderer = require('./create-shields-renderer')

describe('createShieldsRenderer', () => {
  it('should create flat shield by default', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(shields('travis')).to.eq('[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create flat travis shield', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(shields.flat('travis')).to.eq('[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create flat square travis shield', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(shields.flatSquare('travis')).to.eq('[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create plastic travis shield', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(shields.plastic('travis')).to.eq('[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=plastic)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create several shields', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(shields.plastic('travis', 'npm')).to.eq([
      '[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=plastic)](https://travis-ci.org/zkochan/mos)',
      '[![NPM version](https://img.shields.io/npm/v/mos.svg?style=plastic)](https://www.npmjs.com/package/mos)',
    ].join('\n'))
  })

  it('should throw exception if shield not supported', () => {
    const shields = createShieldsRenderer({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(() => shields('no-such-shield'))
      .to.throw(Error, '`no-such-shield` shield is not supported')
  })
})
