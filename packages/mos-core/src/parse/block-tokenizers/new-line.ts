import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import createScanner from '../scanner'

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
  const scanner = createScanner(value)

  if (!scanner.next('\n', 1)) {
    return false
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let subvalue = '\n'
  let queue = ''

  while (!scanner.eos() && !isWhiteSpace(scanner.peek())) {
    const character = scanner.next()

    queue += character

    if (character === '\n') {
      subvalue += queue
      queue = ''
    }
  }

  parser.eat(subvalue)
  return true
}

export default tokenizeNewline
