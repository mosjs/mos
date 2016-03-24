'use strict'
const fs = require('fs')
const renderAll = require('./render-all')

renderAll((opts) => {
  fs.writeFileSync(opts.filePath, opts.newMD, {
    encoding: 'utf8',
  })
})
