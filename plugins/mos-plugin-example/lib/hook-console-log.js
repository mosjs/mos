'use strict'
module.exports = hookConsoleLog

const callsites = require('callsites')
const removeLastEOL = require('../../remove-last-eol')

const originalLog = console.log

function hookConsoleLog (filePath) {
  console.log = function () {
    const site = callsiteForFile(filePath)

    originalLog('\n$\n' + JSON.stringify({
      message: getRealConsoleOutput.apply(null, arguments),
      line: site.line - 1,
      column: site.column,
    }))
  }
}

function getRealConsoleOutput () {
  const originalWrite = process.stdout.write

  let message
  process.stdout.write = msg => { message = msg }

  originalLog.apply(console, arguments)

  process.stdout.write = originalWrite

  return removeLastEOL(message)
}

function callsiteForFile (fileName) {
  const stack = trace()
  return stack.find(callsite => callsite.file === fileName)
}

function trace () {
  return callsites().map(callsite => ({
    file: callsite.getFileName() || '?',
    line: callsite.getLineNumber(),
    column: callsite.getColumnNumber(),
  }))
}
