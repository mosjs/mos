import repeat from 'repeat-string'
import renderCodeBlock from './renderers/code-block'

const CODE_INDENT_LENGTH = 4
const CODE_INDENT = repeat(' ', CODE_INDENT_LENGTH)

/**
 * Tokenise an indented code block.
 *
 * @example
 *   tokenizeCode(eat, '\tfoo')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `code` node.
 */
export default function tokenizeCode (parser, value, silent) {
  let index = -1
  let subvalue = ''
  let content = ''
  let subvalueQueue = ''
  let contentQueue = ''
  let indent

  while (++index < value.length) {
    let character = value.charAt(index)

    if (indent) {
      indent = false

      subvalue += subvalueQueue
      content += contentQueue
      subvalueQueue = contentQueue = ''

      if (character === '\n') {
        subvalueQueue = contentQueue = character
      } else {
        subvalue += character
        content += character

        while (++index < value.length) {
          character = value.charAt(index)

          if (!character || character === '\n') {
            contentQueue = subvalueQueue = character
            break
          }

          subvalue += character
          content += character
        }
      }
    } else if (
        character === ' ' &&
        value.charAt(index + 1) === ' ' &&
        value.charAt(index + 2) === ' ' &&
        value.charAt(index + 3) === ' '
    ) {
      subvalueQueue += CODE_INDENT
      index += 3
      indent = true
    } else if (character === '\t') {
      subvalueQueue += character
      indent = true
    } else {
      let blankQueue = ''

      while (character === '\t' || character === ' ') {
        blankQueue += character
        character = value.charAt(++index)
      }

      if (character !== '\n') {
        break
      }

      subvalueQueue += blankQueue + character
      contentQueue += character
    }
  }

  if (content) {
    if (silent) {
      return true
    }

    return parser.eat(subvalue)(renderCodeBlock(content))
  }
}
