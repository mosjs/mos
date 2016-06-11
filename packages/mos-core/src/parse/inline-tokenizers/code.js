export default tokenizeInlineCode
import isWhiteSpace from '../is-white-space'
import nodeTypes from '../node-types'

/**
 * Find possible inline code.
 *
 * @example
 *   locateInlineCode('foo `bar') // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible inline code.
 */
function locateInlineCode (parser, value, fromIndex) {
  return value.indexOf('`', fromIndex)
}

/**
 * Tokenise inline code.
 *
 * @example
 *   tokenizeInlineCode(eat, '`foo()`')
 *
 * @property {Function} locator - Inline code locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `inlineCode` node.
 */
function tokenizeInlineCode (parser, value, silent) {
  let index = 0
  let queue = ''
  let tickQueue = ''

  while (index < value.length) {
    if (value.charAt(index) !== '`') {
      break
    }

    queue += '`'
    index++
  }

  if (!queue) {
    return
  }

  let subvalue = queue
  const openingCount = index
  queue = ''
  let next = value.charAt(index)
  let count = 0
  let found

  while (index < value.length) {
    var character = next
    next = value.charAt(index + 1)

    if (character === '`') {
      count++
      tickQueue += character
    } else {
      count = 0
      queue += character
    }

    if (count && next !== '`') {
      if (count === openingCount) {
        subvalue += queue + tickQueue
        found = true
        break
      }

      queue += tickQueue
      tickQueue = ''
    }

    index++
  }

  if (!found) {
    if (openingCount % 2 !== 0) {
      return
    }

    queue = ''
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let whiteSpaceQueue
  let contentQueue = whiteSpaceQueue = ''
  index = -1

  while (++index < queue.length) {
    const character = queue.charAt(index)

    if (isWhiteSpace(character)) {
      whiteSpaceQueue += character
      continue
    }

    if (whiteSpaceQueue) {
      if (contentQueue) {
        contentQueue += whiteSpaceQueue
      }

      whiteSpaceQueue = ''
    }

    contentQueue += character
  }

  return parser.eat(subvalue)({
    type: nodeTypes.INLINE_CODE,
    value: contentQueue,
  })
}

tokenizeInlineCode.locator = locateInlineCode
