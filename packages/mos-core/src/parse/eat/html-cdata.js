const CDATA_START = '<![CDATA['
const CDATA_START_LENGTH = CDATA_START.length
const CDATA_END = ']]>'
const CDATA_END_CHAR = CDATA_END.charAt(0)
const CDATA_END_LENGTH = CDATA_END.length

/**
 * Try to match CDATA.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the CDATA at the
 *   start of `value`.
 */
export default function eatHTMLCDATA (value) {
  let index = CDATA_START_LENGTH
  let queue = value.slice(0, index)

  if (queue.toUpperCase() === CDATA_START) {
    while (index < value.length) {
      const character = value.charAt(index)

      if (
        character === CDATA_END_CHAR &&
        value.slice(index, index + CDATA_END_LENGTH) === CDATA_END
      ) {
        return queue + CDATA_END
      }

      queue += character
      index++
    }
  }
}
