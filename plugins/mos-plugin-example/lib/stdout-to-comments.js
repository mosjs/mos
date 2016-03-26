'use strict'
module.exports = stdoutToComments

const removeLastEOL = require('./remove-last-eol')

function stdoutToComments (content) {
  const originalLog = console.log
  const outputs = []

  const wrapperFnName = randomFunctionName()

  console.log = function () {
    const site = callsiteForFunction(wrapperFnName)

    outputs.push({
      message: getRealConsoleOutput.apply(null, arguments),
      line: site.line,
    })
  }

  function getRealConsoleOutput () {
    const originalWrite = process.stdout.write

    let message
    process.stdout.write = msg => { message = msg }

    originalLog.apply(console, arguments)

    process.stdout.write = originalWrite

    return removeLastEOL(message)
  }

  try {
    eval(`void function ${wrapperFnName}() {${content}}()`) // eslint-disable-line no-eval
  } catch (err) {
    throw err
  } finally {
    console.log = originalLog
  }

  return content.split('\n').reduce((contentLines, line, index) => {
    contentLines.push(line)

    const lineNo = index + 1
    while (outputs.length && outputs[0].line === lineNo) {
      contentLines.push('//> ' + outputs.shift().message.replace(/\r?\n/g, '\n//  '))
    }
    return contentLines
  }, []).join('\n')
}

function callsiteForFunction (fnName) {
  const stack = trace()
  return stack.find(callSite => callSite.func === fnName)
}

function randomFunctionName () {
  return '_' + Math.random().toString().replace('.', '')
}

function trace () {
  const stack = getStack()
  return stack.map(parseCallSite)
}

function parseCallSite (callSite) {
  return {
    file: callSite.getFileName() || '?',
    line: callSite.getLineNumber(),
    func: callSite.getFunctionName() || '?',
  }
}

function getStack () {
  const orig = Error.prepareStackTrace
  Error.prepareStackTrace = function (_, stack) { return stack }
  const err = new Error()
  const stack = err.stack
  Error.prepareStackTrace = orig
  return stack
}
