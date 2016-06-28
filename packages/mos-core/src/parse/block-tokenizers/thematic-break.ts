import {ruleMarkers} from '../shared-constants'
import Tokenizer from '../tokenizer'
import createScanner from '../scanner'
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
  const scanner = createScanner(value)

  let subvalue = scanner.next(ch => ch === ' ' || ch === '\t') || ''

  const marker = scanner.next()

  if (!ruleMarkers.has(marker)) {
    return false
  }

  subvalue += marker
  let markerCount = 1
  let queue = ''

  while (!scanner.eos()) {
    const character = scanner.next()

    if (character === marker) {
      markerCount++
      subvalue += queue + marker
      queue = ''
      continue
    }

    if (character === ' ') {
      queue += character
      continue
    }

    if (character === '\n') {
      break
    }

    return false
  }

  if (markerCount < THEMATIC_BREAK_MARKER_COUNT) {
    return false
  }

  subvalue += queue

  if (silent) {
    return true
  }

  return parser.eat(subvalue)({
    type: 'thematicBreak',
  })
}

export default tokenizeThematicBreak
