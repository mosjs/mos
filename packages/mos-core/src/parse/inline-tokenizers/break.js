export default tokenizeBreak
import nodeTypes from '../node-types'

const MIN_BREAK_LENGTH = 2

/**
 * Find a possible break.
 *
 * @example
 *   locateBreak('foo   \nbar') // 3
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible break.
 */
function locateBreak (parser, value, fromIndex) {
  let index = value.indexOf('\n', fromIndex)

  while (index > fromIndex) {
    if (value.charAt(index - 1) !== ' ') {
      break
    }

    index--
  }

  return index
}

/**
 * Tokenise a break.
 *
 * @example
 *   tokenizeBreak(eat, '  \n')
 *
 * @property {Function} locator - Break locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `break` node.
 */
function tokenizeBreak (parser, value, silent) {
  const breaks = parser.options.breaks
  let index = -1
  let queue = ''

  while (++index < value.length) {
    const character = value.charAt(index)

    if (character === '\n') {
      if (!breaks && index < MIN_BREAK_LENGTH) {
        return
      }

      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      queue += character
      return parser.eat(queue)({
        type: nodeTypes.BREAK,
      })
    }

    if (character !== ' ') {
      return
    }

    queue += character
  }
}

tokenizeBreak.locator = locateBreak
