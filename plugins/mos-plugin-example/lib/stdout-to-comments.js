'use strict'
module.exports = stdoutToComments

const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const hookPath = path.resolve(__dirname, './hook-console-log')

function stdoutToComments (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return reject(err)

      const ast = acorn.parse(content, {locations: true})

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
          splitIntoLines(data)
            .forEach(line => eval(`outputs.push(${line})`)) // eslint-disable-line no-eval
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

        const codeLines = splitIntoLines(content)
        const sOutputs = moveOutputsBeloveStatement(ast, outputs, codeLines)

        resolve(codeLines.reduce((contentLines, line, index) => {
          contentLines.push(line)
          const lineNo = index + 1
          while (sOutputs.length && sOutputs[0].line === lineNo) {
            const matches = (contentLines[contentLines.length - 1] || '').match(/^(\s*)/)
            const linePadding = matches && matches[0] || ''
            contentLines.push(linePadding + '//> ' +
              sOutputs.shift().message.replace(/\r?\n/g, '\n' + linePadding + '//  '))
          }
          return contentLines
        }, []).join('\n'))
      })

      function moveOutputsBeloveStatement (ast, outputs, codeLines) {
        let semanticLineNo = 0
        const newOutputs = []
        for (let i = 0, lineNo = 0; i < outputs.length; i++) {
          if (outputs[i].line !== lineNo) {
            const pos = locToPos(codeLines, outputs[i])
            semanticLineNo = outputSemanticPosition(ast, pos)
          }
          newOutputs[i] = Object.assign(
            {},
            outputs[i],
            {
              line: semanticLineNo,
            }
          )
        }
        return newOutputs
      }
    })
  })
}

function splitIntoLines (txt) {
  return txt.split('\n')
}

function locToPos (codeLines, loc) {
  return codeLines
    .slice(0, loc.line - 1)
    .reduce((totalCols, codeLine) => totalCols + codeLine.length, 0) + loc.column
}

function outputSemanticPosition (ast, pos) {
  const node = walk.findNodeAfter(ast, pos)
  return node.node.loc.end.line
}

function addHook (opts) {
  if (!opts.code.match(/['"]use strict['"]/)) {
    return `require('${hookPath}')('${opts.filePath}');\n` + opts.code
  }
  return `'use strict';require('${hookPath}')('${opts.filePath}');\n` + opts.code
}
