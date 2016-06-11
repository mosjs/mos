import {RULE_MARKERS} from '../shared-constants'
import nodeTypes from '../node-types'
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
export default function tokenizeThematicBreak (parser, value, silent) {
  let index = -1
  const length = value.length + 1
  let subvalue = ''
  let character
  let marker
  let markerCount
  let queue

  while (++index < length) {
    character = value.charAt(index)

    if (character !== '\t' && character !== ' ') {
      break
    }

    subvalue += character
  }

  if (RULE_MARKERS[character] !== true) {
    return
  }

  marker = character
  subvalue += character
  markerCount = 1
  queue = ''

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
        type: nodeTypes.THEMATIC_BREAK,
      })
    } else {
      return
    }
  }
}
