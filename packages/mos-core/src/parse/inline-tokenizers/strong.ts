import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'
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
const tokenizeStrong: Tokenizer = function (parser, value, silent) {
  let index = 0
  let character = value.charAt(index)

  if (
    !~'*_'.indexOf(character) ||
    value.charAt(++index) !== character
  ) {
    return false
  }

  const pedantic = parser.options.pedantic
  const marker = character
  const subvalue = marker + marker
  index++
  let queue = character = ''

  if (pedantic && isWhiteSpace(value.charAt(index))) {
    return false
  }

  let prev: string
  while (index < value.length) {
    prev = character
    character = value.charAt(index)

    if (
      character === marker &&
      value.charAt(index + 1) === marker &&
      (!pedantic || !isWhiteSpace(prev))
    ) {
      character = value.charAt(index + 2)

      if (character !== marker) {
        if (!queue.trim()) {
          return false
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        const now = parser.eat.now()
        now.column += 2
        now.offset += 2

        return parser.eat(subvalue + queue + subvalue)(
          parser.tokenizeInline(queue, now)
            .then(children => (<Node>{ type: 'strong', children }))
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
  return false
}

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
tokenizeStrong.locator = function (parser, value, fromIndex) {
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

export default tokenizeStrong
