import isWhiteSpace from '../is-white-space'
import {normalizeIdentifier as normalize} from '../../utilities'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'

const EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm

/**
 * Tokenise a footnote definition.
 *
 * @example
 *   tokenizeFootnoteDefinition(eat, '[^foo]: Bar.')
 *
 * @property {boolean} notInList
 * @property {boolean} notInBlock
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `footnoteDefinition` node.
 */
const tokenizeFootnoteDefinition: Tokenizer = function (parser, value, silent) {
  let character: string

  if (!parser.options.footnotes) {
    return false
  }

  let index = 0
  let length = value.length
  let subvalue = ''
  const now = parser.eat.now()
  const indent = parser.indent(now.line)

  while (index < length) {
    character = value.charAt(index)

    if (!isWhiteSpace(character)) {
      break
    }

    subvalue += character
    index++
  }

  if (
    value.charAt(index) !== '[' ||
    value.charAt(index + 1) !== '^'
  ) {
    return false
  }

  subvalue += '[^'
  index = subvalue.length
  let queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (character === ']') {
      break
    } else if (character === '\\') {
      queue += character
      index++
      character = value.charAt(index)
    }

    queue += character
    index++
  }

  if (
    !queue ||
    value.charAt(index) !== ']' ||
    value.charAt(index + 1) !== ':'
  ) {
    return false
  }

  if (silent) {
    return true
  }

  const identifier = normalize(queue)
  subvalue += `${queue}]:`
  index = subvalue.length

  while (index < length) {
    character = value.charAt(index)

    if (
      character !== '\t' &&
      character !== ' '
    ) {
      break
    }

    subvalue += character
    index++
  }

  now.column += subvalue.length
  now.offset += subvalue.length
  let content: string
  let subqueue: string
  queue = content = subqueue = ''

  while (index < length) {
    character = value.charAt(index)

    if (character === '\n') {
      subqueue = character
      index++

      while (index < length) {
        character = value.charAt(index)

        if (character !== '\n') {
          break
        }

        subqueue += character
        index++
      }

      queue += subqueue
      subqueue = ''

      while (index < length) {
        character = value.charAt(index)

        if (character !== ' ') {
          break
        }

        subqueue += character
        index++
      }

      if (!subqueue.length) {
        break
      }

      queue += subqueue
    }

    if (queue) {
      content += queue
      queue = ''
    }

    content += character
    index++
  }

  subvalue += content

  content = content.replace(EXPRESSION_INITIAL_TAB, line => {
    indent(line.length)

    return ''
  })

  parser.context.inBlock = true

  return parser.eat(subvalue)(
    parser.tokenizeBlock(content, now)
    .then(children => {
      parser.context.inBlock = false
      return <Node>{
        type: 'footnoteDefinition',
        identifier,
        children,
      }
    }))
}

tokenizeFootnoteDefinition.notInList = true
tokenizeFootnoteDefinition.notInBlock = true

export default tokenizeFootnoteDefinition
