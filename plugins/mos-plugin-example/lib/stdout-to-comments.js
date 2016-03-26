'use strict'
module.exports = stdoutToComments

const removeLastEOL = require('./remove-last-eol')
const fs = require('fs')

function stdoutToComments (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return reject(err)

      const originalLog = console.log
      const outputs = []

      console.log = function () {
        const site = callsiteForFile(filePath)

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
        require(filePath)
      } catch (err) {
        throw err
      } finally {
        console.log = originalLog
      }

      resolve(content.split('\n').reduce((contentLines, line, index) => {
        contentLines.push(line)

        const lineNo = index + 1
        while (outputs.length && outputs[0].line === lineNo) {
          contentLines.push('//> ' + outputs.shift().message.replace(/\r?\n/g, '\n//  '))
        }
        return contentLines
      }, []).join('\n'))
    })
  })
}

function callsiteForFile (fileName) {
  const stack = trace()
  return stack.reverse().find(callSite => callSite.file === fileName)
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