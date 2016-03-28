'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const renderLicense = require('./render-license')

describe('renderLicense', () => {
  it("should create license with link to the author's website", () => {
    const pkg = {
      author: {
        name: 'Zoltan Kochan',
        url: 'http://kochan.io',
      },
      license: 'MIT',
    }
    const license = renderLicense(pkg)
    expect(license).to
      .eq('## License\n\nMIT © [Zoltan Kochan](http://kochan.io)')
  })

  it("should create license with author's name", () => {
    const pkg = {
      author: {
        name: 'Zoltan Kochan',
      },
      license: 'MIT',
    }
    const license = renderLicense(pkg)
    expect(license).to.eq('## License\n\nMIT © Zoltan Kochan')
  })
})
