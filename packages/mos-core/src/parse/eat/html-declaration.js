import isWhiteSpace from '../is-white-space'
import isAlphabetic from '../is-alphabetic'

/**
 * Try to match a declaration.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the declaration at
 *   the start of `value`.
 */
export default function eatHTMLDeclaration (value) {
  let index = 0
  const length = value.length
  let queue = ''
  let subqueue = ''
  let character

  if (
      value.charAt(index) === '<' &&
      value.charAt(++index) === '!'
  ) {
    queue = '<' + '!'
    index++

      /*
       * Eat as many alphabetic characters as
       * possible.
       */

    while (index < length) {
      character = value.charAt(index)

      if (!isAlphabetic(character)) {
        break
      }

      subqueue += character
      index++
    }

    character = value.charAt(index)

    if (!subqueue || !isWhiteSpace(character)) {
      return
    }

    queue += subqueue + character
    index++

    while (index < length) {
      character = value.charAt(index)

      if (character === '>') {
        return queue
      }

      queue += character
      index++
    }
  }
}
