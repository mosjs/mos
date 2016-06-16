const ERR_MISSING_LOCATOR = 'Missing locator: '
import Tokenizer from '../tokenizer'

/**
 * Tokenise a text node.
 *
 * @example
 *   tokenizeText(eat, 'foo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `text` node.
 */
const tokenizeText: Tokenizer = function (parser, value, silent) {
  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let min = value.length

  parser.inlineTokenizers
    .filter(tokenizer => tokenizer.name !== 'text')
    .forEach(tokenizer => {
      const locator = tokenizer.func.locator

      if (!locator) {
        throw new Error(`${ERR_MISSING_LOCATOR}\`${tokenizer.name}\``)
      }

      const position = locator(parser, value, 1)

      if (position !== -1 && position < min) {
        min = position
      }
    })

  const subvalue = value.slice(0, min)
  const now = parser.eat.now()

  return parser.decode(subvalue, now, (content: string, position: any, source: any) => {
    parser.eat(source || content)({
      type: 'text',
      value: content,
    })
  })
}

export default tokenizeText
