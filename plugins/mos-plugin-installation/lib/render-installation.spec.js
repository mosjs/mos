'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const m = require('markdownscript')
const heading = m.heading
const text = m.text
const paragraph = m.paragraph
const code = m.code

const renderInstallation = require('./render-installation')

describe('createInstallation', () => {
  it('should create installation section for global package', () => {
    const pkg = {
      name: 'foo',
      preferGlobal: 'MIT',
    }
    const installation = renderInstallation(pkg)
    expect(installation).to.eql([
      heading({ depth: 2 }, [
        text({
          value: 'Installation',
        }),
      ]),
      paragraph([
        text({
          value: 'This module is installed via npm:',
        }),
      ]),
      code({
        lang: 'sh',
        value: 'npm install foo --global',
      }),
    ])
  })

  it('should create installation section for local package', () => {
    const pkg = {
      name: 'foo',
    }
    const installation = renderInstallation(pkg)
    expect(installation).to.eql([
      heading({ depth: 2 }, [
        text({
          value: 'Installation',
        }),
      ]),
      paragraph([
        text({
          value: 'This module is installed via npm:',
        }),
      ]),
      code({
        lang: 'sh',
        value: 'npm install foo --save',
      }),
    ])
  })

  it('should throw exception for private package', () => {
    const pkg = {
      name: 'foo',
      private: true,
    }
    expect(() => renderInstallation(pkg)).to.throw(Error, 'Cannot generate installation section for a private module')
  })
})
