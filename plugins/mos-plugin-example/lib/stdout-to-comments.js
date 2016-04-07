'use strict'
module.exports = stdoutToComments

const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const SourceMapConsumer = require('source-map').SourceMapConsumer
const normalizePath = require('normalize-path')
const hookPath = normalizePath(path.resolve(__dirname, './hook-console-log'))
const position = require('file-position')
const normalizeNewline = require('normalize-newline')

function stdoutToComments (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return reject(err)

      content = normalizeNewline(content)

      const tmpFileName = normalizePath(filePath + Math.random() + '.js')
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
          data.split('\n$\n')
            .filter(outputJSON => !!outputJSON)
            .map(outputJSON => JSON.parse(outputJSON))
            .forEach(outputInfo => outputs.push(outputInfo))
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

        fs.readFile(filePath + '.map', 'utf8', (err, sourceMap) => {
          if (err) {
            return resolve(insertOutputsToCode(content, outputs))
          }
          const consumer = new SourceMapConsumer(sourceMap)
          const originalOutputs = outputs
            .map(output => Object.assign({}, output, consumer.originalPositionFor({
              line: output.line,
              column: output.column,
            })))
          const sourcesContent = JSON.parse(sourceMap).sourcesContent
          const sourceContent = sourcesContent[sourcesContent.length - 1]
          resolve(insertOutputsToCode(sourceContent, originalOutputs))
        })
      })
    })
  })
}

function insertOutputsToCode (content, outputs) {
  const codeLines = splitIntoLines(content)
  const sOutputs = moveOutputsBeloveStatement(outputs, codeLines, content)

  return codeLines.reduce((contentLines, line, index) => {
    contentLines.push(line)
    const lineNo = index + 1
    while (sOutputs.length && sOutputs[0].line === lineNo) {
      const matches = (contentLines[contentLines.length - 1] || '').match(/^(\s*)/)
      const linePadding = matches && matches[0] || ''
      contentLines.push(linePadding + '//> ' +
        sOutputs.shift().message.replace(/\r?\n/g, '\n' + linePadding + '//  '))
    }
    return contentLines
  }, []).join('\n')
}

function moveOutputsBeloveStatement (outputs, codeLines, content) {
  const ast = acorn.parse(content, {locations: true, sourceType: 'module'})
  const getPosition = position(content)

  let semanticLineNo = 0
  const newOutputs = []
  for (let i = 0, lineNo = 0; i < outputs.length; i++) {
    if (outputs[i].line !== lineNo) {
      const pos = getPosition(outputs[i].line - 1, outputs[i].column)
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

function splitIntoLines (txt) {
  return txt.split('\n')
}

function outputSemanticPosition (ast, pos) {
  const node = walk.findNodeAround(ast, pos, 'ExpressionStatement')
  return node.node.loc.end.line
}

function addHook (opts) {
  if (!opts.code.match(/['"]use strict['"]/)) {
    return `require('${hookPath}')('${opts.filePath}');\n` + opts.code
  }
  return `'use strict';require('${hookPath}')('${opts.filePath}');\n` + opts.code
}
