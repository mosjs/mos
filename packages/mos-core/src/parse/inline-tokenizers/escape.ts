import Tokenizer from '../tokenizer'

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
const tokenizeEscape: Tokenizer = function (parser, value, silent) {
  if (value.charAt(0) === '\\') {
    const character = value.charAt(1)

    if (parser.escape.indexOf(character) !== -1) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      return parser.eat(`\\${character}`)(
        character === '\n'
          ? { type: 'break' }
          : { type: 'text', value: character }
      )
    }
  }
  return false
}

/*
 * Temporarily remove support for escapes in autolinks.
 */
tokenizeEscape.notInAutoLink = true

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
tokenizeEscape.locator = function locateEscape (parser, value, fromIndex) {
  return value.indexOf('\\', fromIndex)
}

export default tokenizeEscape
