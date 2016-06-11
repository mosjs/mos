export default tokenizeEmphasis
import isWhiteSpace from '../is-white-space'
import isAlphabetic from '../is-alphabetic'
import isNumeric from '../is-numeric'
import trim from 'trim'
import nodeTypes from '../node-types'

/*
 * A map of characters, which can be used to mark emphasis.
 */

const EMPHASIS_MARKERS = {}

EMPHASIS_MARKERS['*'] = true
EMPHASIS_MARKERS['_'] = true

/**
 * Check whether `character` is a word character.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is a word
 *   character.
 */
function isWordCharacter (character) {
  return character === '_' ||
    isAlphabetic(character) ||
    isNumeric(character)
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
function locateEmphasis (parser, value, fromIndex) {
  const asterisk = value.indexOf('*', fromIndex)
  const underscore = value.indexOf('_', fromIndex)

  if (underscore === -1) {
    return asterisk
  }

  if (asterisk === -1) {
    return underscore
  }

  return underscore < asterisk ? underscore : asterisk
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
function tokenizeEmphasis (parser, value, silent) {
  let index = 0
  let character = value.charAt(index)
  let now
  let pedantic
  let marker
  let queue
  let subvalue
  let length
  let prev

  if (EMPHASIS_MARKERS[character] !== true) {
    return
  }

  pedantic = parser.options.pedantic
  subvalue = marker = character
  length = value.length
  index++
  queue = character = ''

  if (pedantic && isWhiteSpace(value.charAt(index))) {
    return
  }

  while (index < length) {
    prev = character
    character = value.charAt(index)

    if (
        character === marker &&
        (!pedantic || !isWhiteSpace(prev))
    ) {
      character = value.charAt(++index)

      if (character !== marker) {
        if (!trim(queue) || prev === marker) {
          return
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

          now = parser.eat.now()
          now.column++
          now.offset++

          return parser.eat(subvalue + queue + marker)(
            parser.renderInline(nodeTypes.EMPHASIS, queue, now)
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
}

tokenizeEmphasis.locator = locateEmphasis
