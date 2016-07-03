import {
  inlineTokenizers, blockTokenizers,
  visitors, parser, data, compiler, ParserOptions,
  CompilerOptions, Node, Tokenizer, VisitorsMap, Tokenizers
} from 'mos-core'
import remi, {PluginRegistrator, Plugin} from 'remi'
import remiRunner from 'remi-runner'
import hook, {Hooks} from 'magic-hook'
import getMarkdownMeta, {MarkdownMeta} from './get-markdown-meta'

export type MarkdownFile = {
  content: string,
  filePath?: string,
}
export type PluginOptions = MarkdownFile & MarkdownMeta & { options: any }

export { Tokenizer, PluginRegistrator, Plugin }
export type Processor = {
  inlineTokenizers: Tokenizers,
  blockTokenizers: Tokenizers,
  visitors: VisitorsMap,
  parse: Hooks<(opts: ParserOptions) => Promise<Node>, Promise<Node>>,
  compile: Hooks<(ast: Node, opts: CompilerOptions) => Promise<string>, Promise<string>>,
  process: (opts?: CompilerOptions) => Promise<string>,
}

export default function mos (md: MarkdownFile, plugins?: PluginRegistrator[]): Promise<Processor> {
  plugins = plugins || []
  const defaultOpts: CompilerOptions = {
    listItemIndent: '1',
  }
  const processor: Processor = {
    inlineTokenizers: inlineTokenizers.slice(),
    blockTokenizers: blockTokenizers.slice(),
    visitors: <VisitorsMap>Object.assign({}, visitors),
    parse: hook((opts: ParserOptions): Promise<Node> => {
      return parser({
        inlineTokenizers: processor.inlineTokenizers,
        blockTokenizers: processor.blockTokenizers,
        data: data,
      })(md.content, opts)
    }),
    compile: hook((ast: Node, opts: CompilerOptions): Promise<string> => {
      return Promise.resolve(compiler(processor.visitors)(ast, opts))
    }),
    process: (opts?: CompilerOptions) => processor
      .parse(opts || defaultOpts)
      .then((ast: any) => {
        return processor.compile(ast, opts || defaultOpts)
      }),
  }

  const register = createRegister(processor)

  return getMarkdownMeta(md.filePath)
    .then(meta => register(plugins.map(plugin => (<PluginRegistrator>{
      register: plugin.register,
      options: <PluginOptions>Object.assign({}, md, meta, { options: plugin.options || {} }),
    }))))
    .then(() => processor)
}

function createRegister (processor: any) {
  const registrator = remi(processor)
  registrator.hook(
   remiRunner()
  )
  return registrator.register
}
