import {HeadingNode} from '../../node'
import Tokenizer from '../tokenizer'

const MAX_LINE_HEADING_INDENT = 3

/*
 * A map of characters which can be used to mark setext
 * headers, mapping to their corresponding depth.
 */

const SETEXT_MARKERS = {
  '=': 1,
  '-': 2,
}

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
 const tokenizeLineHeading: Tokenizer = function (parser, value, silent) {
  const now = parser.eat.now()
  const length = value.length
  let index = -1
  let subvalue = ''
  let character: string

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

  let content: string
  let queue: string
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
  const marker = value.charAt(++index)

  if (
    character !== '\n' ||
    !SETEXT_MARKERS[marker]
  ) {
    return false
  }

  if (silent) {
    return true
  }

  subvalue += character

    /*
     * Eat Setext-line.
     */

  queue = marker
  const depth = SETEXT_MARKERS[marker]

  while (++index < length) {
    character = value.charAt(index)

    if (character !== marker) {
      if (character !== '\n') {
        return false
      }

      index--
      break
    }

    queue += character
  }

  return parser.eat(subvalue + queue)(
    parser.tokenizeInline(content, now)
      .then(children => (<HeadingNode>{
        type: 'heading',
        depth,
        children,
      }))
  )
}

export default tokenizeLineHeading
