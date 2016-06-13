import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'

/**
 * Tokenise a line.
 *
 * @example
 *   tokenizeNewline(eat, '\n\n');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {boolean?} - `true` when matching.
 */
const tokenizeNewline: Tokenizer = function (parser, value, silent) {
  let character = value.charAt(0)

  if (character !== '\n') {
    return false
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let index = 1
  let subvalue = '\n'
  let queue = ''

  while (index < value.length) {
    character = value.charAt(index)

    if (!isWhiteSpace(character)) {
      break
    }

    queue += character

    if (character === '\n') {
      subvalue += queue
      queue = ''
    }

    index++
  }

  parser.eat(subvalue)
  return true
}

export default tokenizeNewline
