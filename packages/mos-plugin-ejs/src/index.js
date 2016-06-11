import createAsyncScopeEval from './create-async-scope-eval'

const template = new RegExp('^<!--@([\\s\\S]+?)-->(?:[\\s\\S]*?)<!--/@-->')

function matchRecursive (str) {
  const iterator = new RegExp('(<!--@([\\s\\S]+?)-->)|(<!--/@-->)', 'g')
  let openTokens, matchStartIndex, match

  do {
    openTokens = 0
    let firstMatch
    let code
    while ((match = iterator.exec(str))) {
      const inside = str.slice(matchStartIndex, match.index)
      const insideFencedBlock = (inside.match(/```/g) || []).length % 2 !== 0
      if (insideFencedBlock) continue

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

export default function plugin (mos, md) {
  function markdownScript (parser, value, silent) {
    if (!template.exec(value)) return

    const match = matchRecursive(value)

    if (match) {
      if (silent) return true

      return generateMarkdown(parser, match[1])
        .catch(err => {
          const wraperr = new Error(`Failed to execute template code at line ${parser.eat.now().line} with '${err.message}'`)
          wraperr.initialError = err
          throw wraperr
        })
        .then(children => parser.eat(match[0])({
          type: 'markdownScript',
          code: match[1],
          children,
        }))
    }
  }

  markdownScript.locator = (parser, value, fromIndex) => value.indexOf('<!--@', fromIndex)

  mos.visitors.markdownScript = function (compiler, node) {
    const body = mos.visitors.block(compiler, node)
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

  function generateMarkdown (parser, code) {
    return parser.file.asyncScopeEval(code)
      .then(ast => {
        if (ast instanceof Array) return ast
        if (typeof ast === 'object') return [ast]
        parser.offset = parser.offset || {}
        return parser.tokenizeBlock(ast.toString())
      })
  }

  mos.root.scope = {}

  mos.parse.pre((next, md, opts) => {
    md.vfile.asyncScopeEval = createAsyncScopeEval(mos.root.scope, {
      useStrict: true,
    })
    return next.applySame()
  })
}

plugin.attributes = {
  pkg: require('../package.json'),
}
