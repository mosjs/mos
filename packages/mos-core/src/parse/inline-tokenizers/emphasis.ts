import isWhiteSpace from '../is-white-space'
import isAlphabetic from '../is-alphabetic'
import isNumeric from '../is-numeric'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'

/**
 * Check whether `character` is a word character.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is a word
 *   character.
 */
function isWordCharacter (character: string): boolean {
  return character === '_' ||
    isAlphabetic(character) ||
    isNumeric(character)
}

/**
 * Tokenise slight emphasis.
 *
 * @example
 *   tokenizeEmphasis(eat, '*foo*');
 *   tokenizeEmphasis(eat, '_foo_');
 *
 * @property {Function} locator - Slight emphasis locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `emphasis` node.
 */
const tokenizeEmphasis: Tokenizer = function (parser, value, silent) {
  let index = 0
  let character = value.charAt(index)

  if (!~'*_'.indexOf(character)) {
    return false
  }

  const pedantic = parser.options.pedantic
  const subvalue = character
  const marker = character
  index++
  let queue = character = ''

  if (pedantic && isWhiteSpace(value.charAt(index))) {
    return false
  }

  while (index < value.length) {
    const prev = character
    character = value.charAt(index)

    if (
        character === marker &&
        (!pedantic || !isWhiteSpace(prev))
    ) {
      character = value.charAt(++index)

      if (character !== marker) {
        if (!queue.trim() || prev === marker) {
          return false
        }

        if (
            pedantic ||
            marker !== '_' ||
            !isWordCharacter(character)
        ) {
            /* istanbul ignore if - never used (yet) */
          if (silent) {
            return true
          }

          const now = parser.eat.now()
          now.column++
          now.offset++

          return parser.eat(subvalue + queue + marker)(
            parser.tokenizeInline(queue, now)
              .then(children => (<Node>{ type: 'emphasis', children }))
          )
        }
      }

      queue += marker
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
 * Find possible slight emphasis.
 *
 * @example
 *   locateEmphasis('foo *bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible slight emphasis.
 */
tokenizeEmphasis.locator = function (parser, value, fromIndex) {
  const asterisk = value.indexOf('*', fromIndex)
  const underscore = value.indexOf('_', fromIndex)

  if (underscore === -1) {
    return asterisk
  }

  if (asterisk === -1) {
    return underscore
  }

  return Math.min(underscore, asterisk)
}

export default tokenizeEmphasis
