import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'
import createScanner from '../scanner'

/**
 * Tokenise a deletion.
 *
 * @example
 *   tokenizeDeletion(eat, '~~foo~~')
 *
 * @property {Function} locator - Deletion locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `delete` node.
 */
const tokenizeDeletion: Tokenizer = function (parser, value, silent) {
  let subvalue = ''
  const scanner = createScanner(value)

  if (
    !parser.options.gfm ||
    scanner.next(2) !== '~~' ||
    isWhiteSpace(scanner.peek())
  ) {
    return false
  }

  const now = parser.eat.now()
  now.column += 2
  now.offset += 2

  let previous = ''
  let preceding = ''

  while (!scanner.eos()) {
    const character = scanner.next()

    if (
      character === '~' &&
      previous === '~' &&
      (!preceding || !isWhiteSpace(preceding))
    ) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      return parser.eat(`~~${subvalue}~~`)(
        parser.tokenizeInline(subvalue, now)
          .then(children => (<Node>{ type: 'delete', children }))
      )
    }

    subvalue += previous
    preceding = previous
    previous = character
  }
  return false
}

/**
 * Find a possible deletion.
 *
 * @example
 *   locateDeletion('foo ~~bar') // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible deletion.
 */
tokenizeDeletion.locator = function (parser, value, fromIndex) {
  return value.indexOf('~~', fromIndex)
}

export default tokenizeDeletion
