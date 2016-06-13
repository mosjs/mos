const COMMENT_START = '<!--'
const COMMENT_START_LENGTH = COMMENT_START.length
const COMMENT_END = '-->'
const COMMENT_END_CHAR = COMMENT_END.charAt(0)
const COMMENT_END_LENGTH = COMMENT_END.length

/**
 * Try to match comment.
 *
 * @param {string} value - Value to parse.
 * @param {Object} settings - Configuration as available on
 *   a parser.
 * @return {string?} - When applicable, the comment at the
 *   start of `value`.
 */
function eatHTMLComment (value: string, settings: any): string {
  let index = COMMENT_START_LENGTH
  let queue = COMMENT_START
  const length = value.length
  const commonmark = settings.commonmark
  let character: string
  let hasNonDash: boolean

  if (value.slice(0, index) === queue) {
    while (index < length) {
      character = value.charAt(index)

      if (
        character === COMMENT_END_CHAR &&
        value.slice(index, index + COMMENT_END_LENGTH) === COMMENT_END
      ) {
        return queue + COMMENT_END
      }

      if (commonmark) {
        if (character === '>' && !hasNonDash) {
          return null
        }

        if (character === '-') {
          if (value.charAt(index + 1) === '-') {
            return null
          }
        } else {
          hasNonDash = true
        }
      }

      queue += character
      index++
    }
  }
  return null
}

export default eatHTMLComment
