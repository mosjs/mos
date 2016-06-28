import {HeadingNode} from '../../node'
import Tokenizer from '../tokenizer'
import createScanner from '../scanner'
const MAX_ATX_COUNT = 6

/**
 * Tokenise an ATX-style heading.
 *
 * @example
 *   tokenizeHeading(eat, ' # foo')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `heading` node.
 */
const tokenizeHeading: Tokenizer = function (parser, value, silent) {
  const settings = parser.options
  const now = parser.eat.now()
  let subvalue = ''
  let character: string
  const scanner = createScanner(value)

  subvalue += scanner.next(new RegExp(`( |\t)*(#{1,${MAX_ATX_COUNT}})`))

  const depth = (scanner.getCapture(1) || '').length

  if (
    !depth ||
    (!settings.pedantic && scanner.peek() === '#')
  ) {
    return false
  }

  /*
   * Eat intermediate white-space.
   */

  let queue = scanner.next(ch => ch === ' ' || ch === '\t') || ''

  /*
   * Exit when not in pedantic mode without spacing.
   */

  if (
    !settings.pedantic &&
    !queue.length &&
    scanner.peek() !== '\n'
  ) {
    return false
  }

  if (silent) {
    return true
  }

  /*
   * Eat content.
   */

  subvalue += queue
  let content = ''
  queue = content = ''

  while (!scanner.eos() && scanner.peek() !== '\n') {
    character = scanner.next()

    if (
      character !== ' ' &&
      character !== '\t' &&
      character !== '#'
    ) {
      content += queue + character
      queue = ''
      continue
    }

    queue += character + scanner.next(/( |\t)*#*( |\t)*/) || ''
  }

  now.column += subvalue.length
  now.offset += subvalue.length
  subvalue += content + queue

  return parser.eat(subvalue)(
    parser
      .tokenizeInline(content, now)
      .then(children => (<HeadingNode>{
        type: 'heading',
        depth,
        children,
      }))
    )
}

export default tokenizeHeading
