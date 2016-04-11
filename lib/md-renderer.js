'use strict'
module.exports = mdRenderer

const remark = require('remark')
const remarkMos = require('./remark-mos')

function mdRenderer (scope) {
  const processor = remark().use(remarkMos, {scope})

  return md => new Promise((resolve, reject) => {
    processor.process(md, (err, result) => {
      return err ? reject(err) : resolve(processor.stringify(result, {
        listItemIndent: '1',
      }))
    })
  })
}
