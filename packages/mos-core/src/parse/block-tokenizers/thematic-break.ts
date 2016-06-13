import {ruleMarkers} from '../shared-constants'
import Tokenizer from '../tokenizer'
const THEMATIC_BREAK_MARKER_COUNT = 3

/**
 * Tokenise a horizontal rule.
 *
 * @example
 *   tokenizeThematicBreak(eat, '***');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `thematicBreak` node.
 */
const tokenizeThematicBreak: Tokenizer = function (parser, value, silent) {
  let index = -1
  const length = value.length + 1
  let subvalue = ''
  let character: string

  while (++index < length) {
    character = value.charAt(index)

    if (character !== '\t' && character !== ' ') {
      break
    }

    subvalue += character
  }

  if (!ruleMarkers.has(character)) {
    return false
  }

  const marker = character
  subvalue += character
  let markerCount = 1
  let queue = ''

  while (++index < length) {
    character = value.charAt(index)

    if (character === marker) {
      markerCount++
      subvalue += queue + marker
      queue = ''
    } else if (character === ' ') {
      queue += character
    } else if (
        markerCount >= THEMATIC_BREAK_MARKER_COUNT &&
        (!character || character === '\n')
    ) {
      subvalue += queue

      if (silent) {
        return true
      }

      return parser.eat(subvalue)({
        type: 'thematicBreak',
      })
    } else {
      return false
    }
  }
  return false
}

export default tokenizeThematicBreak
