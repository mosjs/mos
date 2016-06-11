import isWhiteSpace from '../is-white-space'
import nodeTypes from '../node-types'
import {normalizeIdentifier as normalize} from '../../utilities'

/**
 * Check whether `character` can be inside an enclosed
 * URI.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Character to test.
 * @return {boolean} - Whether `character` can be inside
 *   an enclosed URI.
 */
function isEnclosedURLCharacter (character) {
  return character !== '>' &&
    character !== '[' &&
    character !== ']'
}

isEnclosedURLCharacter.delimiter = '>'

/**
 * Check whether `character` can be inside an unclosed
 * URI.
 *
 * @param {string} character - Character to test.
 * @return {boolean} - Whether `character` can be inside
 *   an unclosed URI.
 */
function isUnclosedURLCharacter (character) {
  return character !== '[' &&
    character !== ']' &&
    !isWhiteSpace(character)
}

/**
 * Tokenise a definition.
 *
 * @example
 *   var value = '[foo]: http://example.com "Example Domain"'
 *   tokenizeDefinition(eat, value)
 *
 * @property {boolean} onlyAtTop
 * @property {boolean} notInBlockquote
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `definition` node.
 */
export default function tokenizeDefinition (parser, value, silent) {
  const commonmark = parser.options.commonmark
  let index = 0
  const length = value.length
  let subvalue = ''
  let beforeURL
  let beforeTitle
  let queue
  let character
  let test
  let identifier
  let url
  let title

  while (index < length) {
    character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    subvalue += character
    index++
  }

  character = value.charAt(index)

  if (character !== '[') {
    return
  }

  index++
  subvalue += character
  queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (character === ']') {
      break
    } else if (character === '\\') {
      queue += character
      index++
      character = value.charAt(index)
    }

    queue += character
    index++
  }

  if (
    !queue ||
    value.charAt(index) !== ']' ||
    value.charAt(index + 1) !== ':'
  ) {
    return
  }

  identifier = queue
  subvalue += `${queue}]:`
  index = subvalue.length
  queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (
      character !== '\t' &&
      character !== ' ' &&
      character !== '\n'
    ) {
      break
    }

    subvalue += character
    index++
  }

  character = value.charAt(index)
  queue = ''
  beforeURL = subvalue

  if (character === '<') {
    index++

    while (index < length) {
      character = value.charAt(index)

      if (!isEnclosedURLCharacter(character)) {
        break
      }

      queue += character
      index++
    }

    character = value.charAt(index)

    if (character !== isEnclosedURLCharacter.delimiter) {
      if (commonmark) {
        return
      }

      index -= queue.length + 1
      queue = ''
    } else {
      subvalue += `<${queue}${character}`
      index++
    }
  }

  if (!queue) {
    while (index < length) {
      character = value.charAt(index)

      if (!isUnclosedURLCharacter(character)) {
        break
      }

      queue += character
      index++
    }

    subvalue += queue
  }

  if (!queue) {
    return
  }

  url = queue
  queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (
      character !== '\t' &&
      character !== ' ' &&
      character !== '\n'
    ) {
      break
    }

    queue += character
    index++
  }

  character = value.charAt(index)
  test = null

  if (character === '"') {
    test = '"'
  } else if (character === '\'') {
    test = '\''
  } else if (character === '(') {
    test = ')'
  }

  if (!test) {
    queue = ''
    index = subvalue.length
  } else if (!queue) {
    return
  } else {
    subvalue += queue + character
    index = subvalue.length
    queue = ''

    while (index < length) {
      character = value.charAt(index)

      if (character === test) {
        break
      }

      if (character === '\n') {
        index++
        character = value.charAt(index)

        if (character === '\n' || character === test) {
          return
        }

        queue += '\n'
      }

      queue += character
      index++
    }

    character = value.charAt(index)

    if (character !== test) {
      return
    }

    beforeTitle = subvalue
    subvalue += queue + character
    index++
    title = queue
    queue = ''
  }

  while (index < length) {
    character = value.charAt(index)

    if (character !== '\t' && character !== ' ') {
      break
    }

    subvalue += character
    index++
  }

  character = value.charAt(index)

  if (!character || character === '\n') {
    if (silent) {
      return true
    }

    beforeURL = parser.eat(beforeURL).test().end
    url = parser.decode.raw(parser.descape(url), beforeURL)

    if (title) {
      beforeTitle = parser.eat(beforeTitle).test().end
      title = parser.decode.raw(parser.descape(title), beforeTitle)
    }

    return parser.eat(subvalue)({
      type: nodeTypes.DEFINITION,
      identifier: normalize(identifier),
      title: title || null,
      url,
    })
  }
}

tokenizeDefinition.onlyAtTop = true
tokenizeDefinition.notInBlockquote = true
