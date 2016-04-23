'use strict'
module.exports = mdRenderer

const remark = require('remark')
const remarkMos = require('./remark-mos')
const remarkToc = require('remark-toc')
const initCusomtRemarkPlugins = require('./init-custom-remark-plugins')

function mdRenderer (scope) {
  const processor = initCusomtRemarkPlugins(remark())
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
