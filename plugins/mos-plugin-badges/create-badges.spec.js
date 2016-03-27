'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const createBadges = require('./create-badges')

describe('createBadges', () => {
  it('should create flat badge by default', () => {
    const badges = createBadges({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(badges('travis')).to.eq('[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=flat)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create flat travis badge', () => {
    const badges = createBadges({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(badges.flat('travis')).to.eq('[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=flat)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create flat square travis badge', () => {
    const badges = createBadges({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(badges.flatSquare('travis')).to.eq('[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=flat-square)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create plastic travis badge', () => {
    const badges = createBadges({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(badges.plastic('travis')).to.eq('[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=plastic)](https://travis-ci.org/zkochan/mos)')
  })

  it('should create several badges', () => {
    const badges = createBadges({
      github: {
        user: 'zkochan',
        repo: 'mos',
      },
      pkg: {
        name: 'mos',
      },
    })
    expect(badges.plastic('travis', 'npm')).to.eq([
      '[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=plastic)](https://travis-ci.org/zkochan/mos)',
      '[![NPM version](https://img.shields.io/npm/v/mos.svg?style=plastic)](https://www.npmjs.com/package/mos)',
    ].join('\n'))
  })
})
