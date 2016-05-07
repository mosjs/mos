'use strict'
module.exports = mos

const remark = require('@zkochan/remark')
const remarkToc = require('@zkochan/remark-toc')
const remarkMos = require('remark-mos')
const visit = require('async-unist-util-visit')
const getMarkdownMeta = require('./get-markdown-meta')
const createMDScope = require('./create-md-scope')

const defaultPlugins = [
  require('mos-plugin-package-json'),
  require('mos-plugin-installation'),
  require('mos-plugin-license'),
  require('mos-plugin-shields'),
  require('mos-plugin-example'),
  require('mos-plugin-dependencies'),
  require('mos-plugin-snippet'),
  require('mos-plugin-markdownscript'),
]

const defaultRemarkPlugins = [[remarkToc]]

function mos () {
  let mosPlugins = defaultPlugins
  const remarkPlugins = defaultRemarkPlugins

  const remarkSettings = {
    listItemIndent: '1',
  }

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
      return createRemark(opts)
        .then(remarkProcessor => {
          if (typeof md === 'object') {
            return visit(md, 'markdownScript', node =>
              remarkProcessor
                .createParser()
                .generateMarkdown(node.code)
                .then(children => {
                  node.children = children
                })
            )
            .then(() => remarkProcessor.process(md, remarkSettings))
          }
          return remarkProcessor.process(md, remarkSettings)
        })
        .then(res => res.result)
    },
  }

  function createRemark (opts) {
    opts = opts || {}
    if (!opts.filePath) throw new Error('opts.filePath is required')

    return getMarkdownMeta(opts.filePath)
      .then(markdown => createMDScope(mosPlugins, markdown))
      .then(scope => {
        const remarkProcessor = remark().use(remarkMos, {scope})

        remarkPlugins.forEach(useArgs => remarkProcessor.use.apply(remarkProcessor, useArgs))

        return remarkProcessor
      })
  }

  return processor
}
