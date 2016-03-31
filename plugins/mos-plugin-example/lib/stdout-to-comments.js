'use strict'
module.exports = stdoutToComments

const removeLastEOL = require('../../remove-last-eol')
const fs = require('fs')
const callsites = require('callsites')

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
          const matches = (contentLines[contentLines.length - 1] || '').match(/^(\s*)/)
          const linePadding = matches && matches[0] || ''
          contentLines.push(linePadding + '//> ' +
            outputs.shift().message.replace(/\r?\n/g, '\n' + linePadding + '//  '))
        }
        return contentLines
      }, []).join('\n'))
    })
  })
}

function callsiteForFile (fileName) {
  const stack = trace()
  return stack.find(callsite => callsite.file === fileName)
}

function trace () {
  return callsites().map(callsite => ({
    file: callsite.getFileName() || '?',
    line: callsite.getLineNumber(),
  }))
}
