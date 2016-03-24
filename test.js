'use strict'
const renderAll = require('./render-all')

renderAll((opts) => {
  if (normalizeNewline(opts.newMD) !== normalizeNewline(opts.currentMD)) {
    console.log(opts.filePath + ' is not up to date!')
    process.exit(1)
  }
})

function normalizeNewline (str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }

  return str.replace(/\r\n/g, '\n').replace(/\n*$/, '')
}
