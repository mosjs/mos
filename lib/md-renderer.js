'use strict'
module.exports = mdRenderer

const remark = require('remark')
const remarkMos = require('./remark-mos')
const remarkToc = require('remark-toc')

function mdRenderer (scope) {
  const processor = remark()
    .use(remarkMos, {scope})
    .use(remarkToc)

  return md => new Promise((resolve, reject) => {
    processor.process(md, (err, result) => {
      return err ? reject(err) : resolve(processor.stringify(result, {
        listItemIndent: '1',
      }))
    })
  })
}
