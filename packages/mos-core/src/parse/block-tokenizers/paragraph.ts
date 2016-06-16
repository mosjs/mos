import trimTrailingLines from 'trim-trailing-lines'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'

import {TAB_SIZE} from '../shared-constants'

/**
 * Tokenise a paragraph node.
 *
 * @example
 *   tokenizeParagraph(eat, 'Foo.')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `paragraph` node.
 */
const tokenizeParagraph: Tokenizer = function (parser, value, silent) {
  const settings = parser.options
  const commonmark = settings.commonmark
  const gfm = settings.gfm
  const index = value.indexOf('\n')
  const length = value.length
  let subvalue: string
  let character: string

  return tokenizeEach(index)
    .then(index => {
      subvalue = value.slice(0, index)

      if (subvalue.trim() === '') {
        parser.eat(subvalue)

        return false
      }

      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return Promise.resolve(true)
      }

      const now = parser.eat.now()
      subvalue = trimTrailingLines(subvalue)

      return parser.eat(subvalue)(
        parser.tokenizeInline(subvalue, now)
          .then(children => (<Node>{ type: 'paragraph', children }))
      )
      .then(() => null)
    })

  function tokenizeEach (index: number): Promise<number> {
    /*
     * Eat everything if there’s no following newline.
     */

    if (index === -1) return Promise.resolve(length)

    /*
     * Stop if the next character is NEWLINE.
     */

    if (value.charAt(index + 1) === '\n') {
      return Promise.resolve(index)
    }

    /*
     * In commonmark-mode, following indented lines
     * are part of the paragraph.
     */

    if (commonmark) {
      let size = 0
      let position = index + 1

      while (position < length) {
        character = value.charAt(position)

        if (character === '\t') {
          size = TAB_SIZE
          break
        } else if (character === ' ') {
          size++
        } else {
          break
        }

        position++
      }

      if (size >= TAB_SIZE) {
        index = value.indexOf('\n', index + 1)
        return tokenizeEach(index)
      }
    }

    /*
     * Check if the following code contains a possible
     * block.
     */

    subvalue = value.slice(index + 1)

    return parser.tryTokenizeBlock(parser.eat, 'thematicBreak', subvalue, true)
      .then(found => {
        if (found) return index

        return parser.tryTokenizeBlock(parser.eat, 'atxHeading', subvalue, true)
          .then(found => {
            if (found) return index

            return parser.tryTokenizeBlock(parser.eat, 'fencedCode', subvalue, true)
              .then(found => {
                if (found) return index

                return parser.tryTokenizeBlock(parser.eat, 'blockquote', subvalue, true)
                  .then(found => {
                    if (found) return index

                    return parser.tryTokenizeBlock(parser.eat, 'html', subvalue, true)
                      .then(found => {
                        if (found) return index

                        if (gfm) {
                          return parser.tryTokenizeBlock(parser.eat, 'list', subvalue, true)
                            .then(found => {
                              if (found) return index

                              return lastCheck()
                            })
                        }

                        return lastCheck()
                      })
                  })
              })
          })
      })

    function lastCheck () {
      if (!commonmark) {
        return parser.tryTokenizeBlock(parser.eat, 'setextHeading', subvalue, true)
          .then(found => {
            if (found) return index

            return parser.tryTokenizeBlock(parser.eat, 'definition', subvalue, true)
              .then(found => {
                if (found) return index

                return parser.tryTokenizeBlock(parser.eat, 'footnote', subvalue, true)
                  .then(found => {
                    if (found) return index

                    return defaultEnd()
                  })
              })
          })
      }

      return defaultEnd()
    }

    function defaultEnd () {
      index = value.indexOf('\n', index + 1)
      return tokenizeEach(index)
    }
  }
}

export default tokenizeParagraph
