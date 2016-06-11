import isWhiteSpace from '../is-white-space'

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
export default function tokenizeNewline (parser, value, silent) {
  let character = value.charAt(0)
  let length
  let subvalue
  let queue
  let index

  if (character !== '\n') {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  index = 1
  length = value.length
  subvalue = '\n'
  queue = ''

  while (index < length) {
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
}
