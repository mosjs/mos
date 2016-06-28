import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import createScanner from '../scanner'

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
const tokenizeInlineCode: Tokenizer = function (parser, value, silent) {
  const scanner = createScanner(value)

  let queue = scanner.next('`')

  if (!queue) {
    return false
  }

  let subvalue = queue
  const openingCount = queue.length
  queue = ''
  let found = false
  let count = 0
  let tickQueue = ''

  while (!scanner.eos()) {
    const character = scanner.next()
    const next = scanner.peek()

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
  }

  if (!found) {
    if (openingCount % 2 !== 0) {
      return false
    }

    queue = ''
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let whiteSpaceQueue = ''
  let contentQueue = ''
  const contentScanner = createScanner(queue)

  while (!contentScanner.eos()) {
    const character = contentScanner.next()

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
    type: 'inlineCode',
    value: contentQueue,
  })
}

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
tokenizeInlineCode.locator = function (parser, value, fromIndex) {
  return value.indexOf('`', fromIndex)
}

export default tokenizeInlineCode
