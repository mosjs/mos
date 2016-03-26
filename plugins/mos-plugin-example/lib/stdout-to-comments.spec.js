'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const stdoutToComments = require('./stdout-to-comments')

describe('stdoutToComments', () => {
  it('should add the console output to the comments', () => {
    const actual = stdoutToComments('console.log("Hello world!")')
    expect(actual).to.eq('console.log("Hello world!")\n//> Hello world!')
  })

  it('should add the multiline console output to the comments', () => {
    const actual = stdoutToComments('console.log("Hello world!\\nHello world!")')
    expect(actual).to.eq([
      'console.log("Hello world!\\nHello world!")',
      '//> Hello world!',
      '//  Hello world!',
    ].join('\n'))
  })

  it('should add several console outputs printed by the same line to the comments', () => {
    const actual = stdoutToComments('for (let i = 3; i--;) console.log("Hello world!")')
    expect(actual).to.eq('for (let i = 3; i--;) console.log("Hello world!")\n//> Hello world!\n//> Hello world!\n//> Hello world!')
  })

  it('should add several console outputs printed by different lines', () => {
    const actual = stdoutToComments([
      'console.log("foo")',
      'console.log("bar")',
    ].join('\n'))
    expect(actual).to.eq([
      'console.log("foo")',
      '//> foo',
      'console.log("bar")',
      '//> bar',
    ].join('\n'))
  })

  it('should add the JSON console output to the comments', () => {
    const actual = stdoutToComments('console.log({foo: "bar"})')
    expect(actual).to.eq('console.log({foo: "bar"})\n//> { foo: \'bar\' }')
  })

  it('should add the console output of a called function', () => {
    const actual = stdoutToComments([
      'function foo (a) {',
      '  console.log(a)',
      '  console.log(a)',
      '}',
      'foo("Hello world!")',
    ].join('\n'))
    expect(actual).to.eq([
      'function foo (a) {',
      '  console.log(a)',
      '  console.log(a)',
      '}',
      'foo("Hello world!")',
      '//> Hello world!',
      '//> Hello world!',
    ].join('\n'))
  })
})
