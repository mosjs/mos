export default tokenizeText

const ERR_MISSING_LOCATOR = 'Missing locator: '
import nodeTypes from '../node-types'

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
function tokenizeText (parser, value, silent) {
  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  let min = value.length

  parser.inlineTokenizers
    .filter(tokenizer => tokenizer.name !== 'inlineText')
    .forEach(tokenizer => {
      const locator = tokenizer.func.locator

      if (!locator) {
        parser.eat.file.fail(`${ERR_MISSING_LOCATOR}\`${tokenizer.name}\``)
        return
      }

      const position = locator(parser, value, 1)

      if (position !== -1 && position < min) {
        min = position
      }
    })

  const subvalue = value.slice(0, min)
  const now = parser.eat.now()

  parser.decode(subvalue, now, (content, position, source) => {
    parser.eat(source || content)({
      type: nodeTypes.TEXT,
      value: content,
    })
  })
}
