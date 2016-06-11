import mosCore from 'mos-core'
import remi from 'remi'
import remiRunner from 'remi-runner'
import hook from 'magic-hook/es5'
import VFile from 'vfile'
import getMarkdownMeta from './get-markdown-meta'

export default function mos (md, plugins) {
  plugins = plugins || []
  const defaultOpts = {
    listItemIndent: '1',
  }
  const processor = {
    inlineTokenizers: mosCore.inlineTokenizers.slice(),
    blockTokenizers: mosCore.blockTokenizers.slice(),
    visitors: Object.assign({}, mosCore.visitors),
    parse: hook(opts => {
      return mosCore.parser({
        inlineTokenizers: processor.inlineTokenizers,
        blockTokenizers: processor.blockTokenizers,
        data: mosCore.data,
      })(md.vfile, opts)
    }),
    compile: hook((ast, opts) => {
      return Promise.resolve(mosCore.compiler(processor.visitors)(ast, opts))
    }),
    process: opts => processor
      .parse(Object.assign(md, {vfile: new VFile(md.content)}), opts || defaultOpts)
      .then(ast => {
        return processor.compile(ast, opts || defaultOpts)
      }),
  }

  const register = createRegister(processor)

  return getMarkdownMeta(md.filePath)
    .then(meta => register(plugins.map(plugin => ({
      register: plugin.register || plugin,
      options: Object.assign({}, md, meta, { options: plugin.options || {} }),
    }))))
    .then(() => processor)
}

function createRegister (processor) {
  const registrator = remi(processor)
  registrator.hook(
   remiRunner()
  )
  return registrator.register
}
