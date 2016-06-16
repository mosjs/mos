import {Node} from '../../node'
import Tokenizer from '../tokenizer'

/**
 * Tokenise a blockquote.
 *
 * @example
 *   tokenizeBlockquote(eat, '> Foo')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `blockquote` node.
 */
const tokenizeBlockquote: Tokenizer = function (parser, value, silent) {
  const now = parser.eat.now()
  const indent = parser.indent(now.line)
  const values: string[] = []
  const contents: string[] = []
  const indents: number[] = []
  let index = 0

  while (index < value.length) {
    const character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    index++
  }

  if (value.charAt(index) !== '>') {
    return false
  }

  if (silent) {
    return true
  }

  index = 0

  return tokenizeEach(index)
    .then(() => {
      index = -1
      const add = parser.eat(values.join('\n'))

      while (++index < indents.length) {
        indent(indents[index])
      }

      parser.context.inBlock = true

      return add(parser.tokenizeBlock(contents.join('\n'), now)
        .then(children => {
          parser.context.inBlock = false
          return <Node>{
            type: 'blockquote',
            children,
          }
        }))
    })

  function tokenizeEach (index: number): Promise<any> {
    if (index >= value.length) {
      return Promise.resolve()
    }

    let nextIndex = value.indexOf('\n', index)
    const startIndex = index
    let prefixed = false

    if (nextIndex === -1) {
      nextIndex = value.length
    }

    while (index < value.length) {
      const character = value.charAt(index)

      if (character !== ' ' && character !== '\t') {
        break
      }

      index++
    }

    if (value.charAt(index) === '>') {
      index++
      prefixed = true

      if (value.charAt(index) === ' ') {
        index++
      }
    } else {
      index = startIndex
    }

    const content = value.slice(index, nextIndex)

    if (!prefixed && !content.trim()) {
      index = startIndex
      return Promise.resolve()
    }

    const rest = value.slice(index)

    if (!prefixed) {
      if (parser.options.commonmark) {
        return parser.tryTokenizeBlock(parser.eat, 'intendedCode', rest, true)
          .then((found: boolean) => {
            if (found) {
              return index
            }

            return parser.tryTokenizeBlock(parser.eat, 'fencedCode', rest, true)
              .then((found: boolean) => {
                if (found) {
                  return index
                }

                return parser.tryTokenizeBlock(parser.eat, 'atxHeading', rest, true)
                  .then((found: boolean) => {
                    if (found) {
                      return index
                    }

                    return parser.tryTokenizeBlock(parser.eat, 'setextHeading', rest, true)
                      .then((found: boolean) => {
                        if (found) {
                          return index
                        }

                        return parser.tryTokenizeBlock(parser.eat, 'thematicBreak', rest, true)
                          .then((found: boolean) => {
                            if (found) {
                              return index
                            }

                            return parser.tryTokenizeBlock(parser.eat, 'html', rest, true)
                              .then((found: boolean) => {
                                if (found) {
                                  return index
                                }

                                return parser.tryTokenizeBlock(parser.eat, 'list', rest, true)
                                  .then((found: boolean) => {
                                    if (found) {
                                      return index
                                    }

                                    return nextNotCommonmark()
                                  })
                              })
                          })
                      })
                  })
              })
          })
      }

      return nextNotCommonmark()
    }

    return next()

    function next () {
      const line = startIndex === index
        ? content
        : value.slice(startIndex, nextIndex)

      indents.push(index - startIndex)
      values.push(line)
      contents.push(content)

      index = nextIndex + 1
      return tokenizeEach(index)
    }

    function nextNotCommonmark () {
      if (!parser.options.commonmark) {
        return parser.tryTokenizeBlock(parser.eat, 'definition', rest, true)
          .then((found: boolean) => {
            if (found) {
              return index
            }

            return parser.tryTokenizeBlock(parser.eat, 'footnote', rest, true)
              .then((found: boolean): any => {
                if (found) {
                  return index
                }

                return next()
              })
          })
      }

      return next()
    }
  }
}

export default tokenizeBlockquote
