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
export default function eatHTMLComment (value, settings) {
  let index = COMMENT_START_LENGTH
  let queue = COMMENT_START
  const length = value.length
  const commonmark = settings.commonmark
  let character
  let hasNonDash

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
          return
        }

        if (character === '-') {
          if (value.charAt(index + 1) === '-') {
            return
          }
        } else {
          hasNonDash = true
        }
      }

      queue += character
      index++
    }
  }
}

export default eatHTMLComment
