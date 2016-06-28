import isWhiteSpace from '../is-white-space'
import isAlphabetic from '../is-alphabetic'
import isNumeric from '../is-numeric'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'
import createScanner from '../scanner'

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
  const scanner = createScanner(value)
  let character = scanner.next()

  if (!~'*_'.indexOf(character)) {
    return false
  }

  const pedantic = parser.options.pedantic
  const subvalue = character
  const marker = character
  let queue = character = ''

  if (pedantic && isWhiteSpace(scanner.peek())) {
    return false
  }

  while (!scanner.eos()) {
    const prev = character
    character = scanner.next()

    if (
      character === marker &&
      (!pedantic || !isWhiteSpace(prev))
    ) {
      character = scanner.next()

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
      character = scanner.next()
    }

    queue += character
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
