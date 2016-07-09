import readPkgUp from 'mos-read-pkg-up'
import {Plugin, Processor, PluginOptions} from 'mos-processor'
import {Tokenizer, ParserAndEater, Node, Compiler} from 'mos-core'
import createAsyncScopeEval from './create-async-scope-eval'

export type MarkdownScriptNode = Node & {
  code: string
}

const template = new RegExp('^<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--/@-->')

function matchRecursive (str: string) {
  const iterator = new RegExp('(<!--@([\\s\\S]+?)-->)|(<!--/@-->)', 'g')
  let openTokens: number
  let matchStartIndex: number
  let match: RegExpExecArray

  do {
    openTokens = 0
    let firstMatch: string
    let code: string
    while ((match = iterator.exec(str))) {
      const inside = str.slice(matchStartIndex, match.index)
      const insideFencedBlock = (inside.match(/```/g) || []).length % 2 !== 0
      if (insideFencedBlock) {
        continue
      }

      if (~match[0].indexOf('<!--@')) {
        if (!openTokens) {
          matchStartIndex = iterator.lastIndex
          firstMatch = match[0]
          code = match[2]
        }
        openTokens++
        continue
      }
      if (openTokens) {
        openTokens--
        if (!openTokens) {
          return [firstMatch + inside + match[0], code]
        }
      }
    }
  } while (openTokens && (iterator.lastIndex = matchStartIndex))
}

const plugin: Plugin = Object.assign(function plugin (mos: Processor, md: PluginOptions) {
  let markdownScript: Tokenizer = function (parser: ParserAndEater, value: string, silent: boolean) {
    if (!template.exec(value)) {
      return
    }

    const match = matchRecursive(value)

    if (match) {
      if (silent) {
        return true
      }

      return generateMarkdown(parser, match[1])
        .catch((err: Error) => {
          const wraperr = new Error(`Failed to execute template code at line ${parser.eat.now().line} with '${err.message}'`)
          wraperr['initialError'] = err
          throw wraperr
        })
        .then((children: Node[]) => parser.eat(match[0])({
          type: 'markdownScript',
          code: match[1],
          children,
        }))
    }
  }

  markdownScript.locator = (parser, value, fromIndex) => value.indexOf('<!--@', fromIndex)

  mos.visitors['markdownScript'] = function (compiler: Compiler, node: MarkdownScriptNode) {
    const body = mos.visitors['block'](compiler, node)
    let bodyWithNL = body ? `\n${body}\n` : body
    if (node.children && node.children.length && node.children[node.children.length - 1].type === 'list') {
      bodyWithNL += '\n'
    }
    return `<!--@${node.code}-->${bodyWithNL}<!--/@-->`
  }

  mos.inlineTokenizers.splice(0, 0, {
    name: 'markdownScript',
    func: markdownScript,
  })
  mos.blockTokenizers.splice(0, 0, {
    name: 'markdownScript',
    func: markdownScript,
  })

  let asyncScopeEval: (code: string) => Promise<Object>

  function generateMarkdown (parser: ParserAndEater, code: string): Promise<Node[]> {
    return asyncScopeEval(code)
      .then((ast: Node[] | Node | string) => {
        if (ast instanceof Array) {
          return <Node[]>ast
        }
        if (typeof ast === 'object') {
          return [<Node>ast]
        }
        parser.offset = parser.offset || {}
        return parser.tokenizeBlock(ast.toString())
      })
  }

  mos['root'].scope = {}

  mos.parse.pre((next, md, opts) => {
    asyncScopeEval = createAsyncScopeEval(mos['root'].scope, {
      useStrict: true,
    })
    return next.applySame()
  })
}, {
  attributes: { pkg: readPkgUp.sync(__dirname).pkg }
})

export default plugin
