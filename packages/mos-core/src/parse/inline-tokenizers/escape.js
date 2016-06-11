import nodeTypes from '../node-types'

/**
 * Tokenise an escape sequence.
 *
 * @example
 *   tokenizeEscape(eat, '\\a')
 *``
 * @property {Function} locator - Escape locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `text` or `break` node.
 */
function tokenizeEscape (parser, value, silent) {
  let character

  if (value.charAt(0) === '\\') {
    character = value.charAt(1)

    if (parser.escape.indexOf(character) !== -1) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      return parser.eat(`\\${character}`)(
        character === '\n'
          ? { type: nodeTypes.BREAK }
          : { type: nodeTypes.TEXT, value: character }
      )
    }
  }
}

tokenizeEscape.locator = locateEscape

/**
 * Find a possible escape sequence.
 *
 * @example
 *   locateEscape('foo \- bar') // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible escape sequence.
 */
function locateEscape (parser, value, fromIndex) {
  return value.indexOf('\\', fromIndex)
}

export default tokenizeEscape
