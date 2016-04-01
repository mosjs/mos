'use strict'
module.exports = stdoutToComments

const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const hookPath = path.resolve(__dirname, './hook-console-log')

function stdoutToComments (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return reject(err)

      const tmpFileName = filePath + Math.random() + '.js'
      fs.writeFileSync(tmpFileName, addHook({
        code: content,
        filePath: tmpFileName,
      }), 'utf8')

      const outputs = []
      let failed = false

      const cp = spawn('node', [tmpFileName])
      cp.stdout.setEncoding('utf8')
      cp.stderr.setEncoding('utf8')
      cp.stdout.on('data', data => {
        try {
          eval(`outputs.push(${data})`) // eslint-disable-line no-eval
        } catch (err) {
          failed = true
          reject(err)
        }
      })
      cp.stderr.on('data', data => console.error(data))
      cp.on('close', code => {
        fs.unlinkSync(tmpFileName)

        if (failed) {
          return
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
  })
}

function addHook (opts) {
  if (!opts.code.match(/['"]use strict['"]/)) {
    return `require('${hookPath}')('${opts.filePath}');` + opts.code
  }
  return `'use strict';require('${hookPath}')('${opts.filePath}');` + opts.code
}
