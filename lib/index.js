'use strict'
module.exports = mos

const remark = require('remark')
const getMarkdownMeta = require('./get-markdown-meta')
const createMDScope = require('./create-md-scope')
const remarkMos = require('./remark-mos')

function mos () {
  let mosPlugins = []
  const remarkPlugins = []

  const processor = {
    use (plugins) {
      mosPlugins = mosPlugins.concat(plugins)
      return processor
    },
    useRemarkPlugin () {
      remarkPlugins.push(arguments)
      return processor
    },
    process (md, opts) {
      return getMarkdownMeta(opts.filePath)
        .then(markdown => createMDScope(mosPlugins, markdown))
        .then(scope => {
          const remarkProcessor = remark().use(remarkMos, {scope})

          remarkPlugins.forEach(useArgs => remarkProcessor.use.apply(remarkProcessor, useArgs))

          return new Promise((resolve, reject) => {
            remarkProcessor.process(md, (err, result) => {
              return err ? reject(err) : resolve(remarkProcessor.stringify(result, {
                listItemIndent: '1',
              }))
            })
          })
        })
    },
  }

  return processor
}
