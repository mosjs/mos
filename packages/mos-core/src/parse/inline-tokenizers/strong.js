export default tokenizeStrong
import trim from 'trim'
import isWhiteSpace from '../is-white-space'
import nodeTypes from '../node-types'

/*
 * A map of characters, which can be used to mark emphasis.
 */

const EMPHASIS_MARKERS = {}

EMPHASIS_MARKERS['*'] = true
EMPHASIS_MARKERS['_'] = true

/**
 * Find a possible strong emphasis.
 *
 * @example
 *   locateStrong('foo **bar') // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible strong emphasis.
 */
function locateStrong (parser, value, fromIndex) {
  const asterisk = value.indexOf('**', fromIndex)
  const underscore = value.indexOf('__', fromIndex)

  if (underscore === -1) {
    return asterisk
  }

  if (asterisk === -1) {
    return underscore
  }

  return underscore < asterisk ? underscore : asterisk
}

/**
 * Tokenise strong emphasis.
 *
 * @example
 *   tokenizeStrong(eat, '**foo**')
 *   tokenizeStrong(eat, '__foo__')
 *
 * @property {Function} locator - Strong emphasis locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `strong` node.
 */
function tokenizeStrong (parser, value, silent) {
  let index = 0
  let character = value.charAt(index)

  if (
    EMPHASIS_MARKERS[character] !== true ||
    value.charAt(++index) !== character
  ) {
    return
  }

  const pedantic = parser.options.pedantic
  const marker = character
  const subvalue = marker + marker
  const length = value.length
  index++
  let queue = character = ''

  if (pedantic && isWhiteSpace(value.charAt(index))) {
    return
  }

  let prev
  while (index < length) {
    prev = character
    character = value.charAt(index)

    if (
      character === marker &&
      value.charAt(index + 1) === marker &&
      (!pedantic || !isWhiteSpace(prev))
    ) {
      character = value.charAt(index + 2)

      if (character !== marker) {
        if (!trim(queue)) {
          return
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        const now = parser.eat.now()
        now.column += 2
        now.offset += 2

        return parser.eat(subvalue + queue + subvalue)(
          parser.renderInline(nodeTypes.STRONG, queue, now)
        )
      }
    }

    if (!pedantic && character === '\\') {
      queue += character
      character = value.charAt(++index)
    }

    queue += character
    index++
  }
}

tokenizeStrong.locator = locateStrong
