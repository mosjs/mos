const MAX_LINE_HEADING_INDENT = 3

/*
 * A map of characters which can be used to mark setext
 * headers, mapping to their corresponding depth.
 */

const SETEXT_MARKERS = {}

SETEXT_MARKERS['='] = 1
SETEXT_MARKERS['-'] = 2

/**
 * Tokenise a Setext-style heading.
 *
 * @example
 *   tokenizeLineHeading(eat, 'foo\n===');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `heading` node.
 */
export default function tokenizeLineHeading (parser, value, silent) {
  const now = parser.eat.now()
  const length = value.length
  let index = -1
  let subvalue = ''
  let content
  let queue
  let character
  let marker
  let depth

  /*
   * Eat initial indentation.
   */

  while (++index < length) {
    character = value.charAt(index)

    if (character !== ' ' || index >= MAX_LINE_HEADING_INDENT) {
      index--
      break
    }

    subvalue += character
  }

  /*
   * Eat content.
   */

  content = queue = ''

  while (++index < length) {
    character = value.charAt(index)

    if (character === '\n') {
      index--
      break
    }

    if (character === ' ' || character === '\t') {
      queue += character
    } else {
      content += queue + character
      queue = ''
    }
  }

  now.column += subvalue.length
  now.offset += subvalue.length
  subvalue += content + queue

  /*
   * Ensure the content is followed by a newline and a
   * valid marker.
   */

  character = value.charAt(++index)
  marker = value.charAt(++index)

  if (
    character !== '\n' ||
    !SETEXT_MARKERS[marker]
  ) {
    return
  }

  if (silent) {
    return true
  }

  subvalue += character

    /*
     * Eat Setext-line.
     */

  queue = marker
  depth = SETEXT_MARKERS[marker]

  while (++index < length) {
    character = value.charAt(index)

    if (character !== marker) {
      if (character !== '\n') {
        return
      }

      index--
      break
    }

    queue += character
  }

  return parser.eat(subvalue + queue)(parser.renderHeading(content, depth, now))
}
