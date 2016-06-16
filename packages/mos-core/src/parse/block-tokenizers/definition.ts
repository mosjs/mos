import {DefinitionNode} from '../../node'
import isWhiteSpace from '../is-white-space'
import {normalizeIdentifier as normalize} from '../../utilities'
import Tokenizer from '../tokenizer'

/**
 * Check whether `character` can be inside an enclosed
 * URI.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Character to test.
 * @return {boolean} - Whether `character` can be inside
 *   an enclosed URI.
 */
const isEnclosedURLCharacter: any = function (character: string): boolean {
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
function isUnclosedURLCharacter (character: string): boolean {
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
 * @property {boolean} notInList
 * @property {boolean} notInBlock
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `definition` node.
 */
const tokenizeDefinition: Tokenizer = function (parser, value, silent) {
  const commonmark = parser.options.commonmark
  let index = 0
  const length = value.length
  let subvalue = ''
  let character: string
  let title: string

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
    return false
  }

  index++
  subvalue += character
  let queue = ''

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
    return false
  }

  const identifier = queue
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
  const beforeURL = subvalue

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
        return false
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
    return false
  }

  let url = queue
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
  let test: string = null

  if (character === '"') {
    test = '"'
  } else if (character === '\'') {
    test = '\''
  } else if (character === '(') {
    test = ')'
  }

  let beforeTitle: string
  if (!test) {
    queue = ''
    index = subvalue.length
  } else if (!queue) {
    return false
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
          return false
        }

        queue += '\n'
      }

      queue += character
      index++
    }

    character = value.charAt(index)

    if (character !== test) {
      return false
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

    const beforeURLNode = parser.eat(beforeURL).test().end
    url = parser.decode.raw(parser.descape(url), beforeURLNode)

    if (title) {
      const beforeTitleNode = parser.eat(beforeTitle).test().end
      title = parser.decode.raw(parser.descape(title), beforeTitleNode)
    }

    return parser.eat(subvalue)(<DefinitionNode>{
      type: 'definition',
      identifier: normalize(identifier),
      title: title || null,
      url,
    })
  }

  return false
}

tokenizeDefinition.notInList = true
tokenizeDefinition.notInBlock = true

export default tokenizeDefinition
