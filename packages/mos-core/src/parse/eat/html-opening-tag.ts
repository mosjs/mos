import isAlphabetic from '../is-alphabetic'
import isNumeric from '../is-numeric'
import isWhiteSpace from '../is-white-space'
import blockElements from '../block-elements'

/**
 * Check whether `character` can be inside an unquoted
 * attribute value.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   an unquoted attribute value.
 */
function isUnquotedAttributeCharacter (character: string): boolean {
  return character !== '"' &&
    character !== '\'' &&
    character !== '=' &&
    character !== '<' &&
    character !== '>' &&
    character !== '`'
}

/**
 * Check whether `character` can be inside a double-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a double-quoted attribute value.
 */
const isDoubleQuotedAttributeCharacter: any = function (character: string): boolean {
  return character !== '"'
}

isDoubleQuotedAttributeCharacter.delimiter = '"'

/**
 * Check whether `character` can be inside a single-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a single-quoted attribute value.
 */
const isSingleQuotedAttributeCharacter: any = function (character: string): boolean {
  return character !== '\''
}

isSingleQuotedAttributeCharacter.delimiter = '\''

/**
 * Try to match an opening tag.
 *
 * @param {string} value - Value to parse.
 * @param {boolean?} [isBlock] - Whether the tag-name
 *   must be a known block-level node to match.
 * @return {string?} - When applicable, the opening tag at
 *   the start of `value`.
 */
export default function eatHTMLOpeningTag (value: string, isBlock?: boolean): string {
  let index = 0
  const length = value.length
  let queue = ''
  let subqueue = ''
  let character = value.charAt(index)
  let hasEquals: boolean
  let test: {
    (character: string): boolean;
    delimiter?: string;
  }

  if (character === '<') {
    queue = character
    subqueue = character = value.charAt(++index)

    if (!isAlphabetic(character)) {
      return null
    }

    index++

      /*
       * Eat as many alphabetic characters as
       * possible.
       */

    while (index < length) {
      character = value.charAt(index)

      if (!isAlphabetic(character) && !isNumeric(character)) {
        break
      }

      subqueue += character
      index++
    }

    if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
      return null
    }

    queue += subqueue
    subqueue = ''

      /*
       * Find attributes.
       */

    while (index < length) {
        /*
         * Eat white-space.
         */

      while (index < length) {
        character = value.charAt(index)

        if (!isWhiteSpace(character)) {
          break
        }

        subqueue += character
        index++
      }

      if (!subqueue) {
        break
      }

        /*
         * Eat an attribute name.
         */

      queue += subqueue
      subqueue = ''
      character = value.charAt(index)

      if (
        isAlphabetic(character) ||
        character === '_' ||
        character === ':'
      ) {
        subqueue = character
        index++

        while (index < length) {
          character = value.charAt(index)

          if (
            !isAlphabetic(character) &&
            !isNumeric(character) &&
            character !== '_' &&
            character !== ':' &&
            character !== '.' &&
            character !== '-'
          ) {
            break
          }

          subqueue += character
          index++
        }
      }

      if (!subqueue) {
        break
      }

      queue += subqueue
      subqueue = ''
      hasEquals = false

        /*
         * Eat zero or more white-space and one
         * equals sign.
         */

      while (index < length) {
        character = value.charAt(index)

        if (!isWhiteSpace(character)) {
          if (!hasEquals && character === '=') {
            hasEquals = true
          } else {
            break
          }
        }

        subqueue += character
        index++
      }

      queue += subqueue
      subqueue = ''

      if (!hasEquals) {
        queue += subqueue
      } else {
        character = value.charAt(index)
        queue += subqueue

        if (character === '"') {
          test = isDoubleQuotedAttributeCharacter
          subqueue = character
          index++
        } else if (character === '\'') {
          test = isSingleQuotedAttributeCharacter
          subqueue = character
          index++
        } else {
          test = isUnquotedAttributeCharacter
          subqueue = ''
        }

        while (index < length) {
          character = value.charAt(index)

          if (!test(character)) {
            break
          }

          subqueue += character
          index++
        }

        character = value.charAt(index)
        index++

        if (!test.delimiter) {
          if (!subqueue.length) {
            return null
          }

          index--
        } else if (character === test.delimiter) {
          subqueue += character
        } else {
          return null
        }

        queue += subqueue
        subqueue = ''
      }
    }

      /*
       * More white-space is already eaten by the
       * attributes subroutine.
       */

    character = value.charAt(index)

      /*
       * Eat an optional backslash (for self-closing
       * tags).
       */

    if (character === '/') {
      queue += character
      character = value.charAt(++index)
    }

    return character === '>' ? queue + character : null
  }
  return null
}
