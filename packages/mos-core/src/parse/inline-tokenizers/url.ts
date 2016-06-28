import decode from 'parse-entities'
import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import renderLink from './renderers/link'
import createScanner from '../scanner'

/*
 * Protocols.
 */

const MAILTO_PROTOCOL = 'mailto:'

const protocolPattern = /https?:\/\/|mailto:/gi
const beginsWithProtocol = new RegExp(`^(${protocolPattern.source})`, 'i')

/**
 * Tokenise a URL in text.
 *
 * @example
 *   tokenizeURL(eat, 'http://foo.bar');
 *
 * @property {boolean} notInLink
 * @property {Function} locator - URL locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `link` node.
 */
const tokenizeURL: Tokenizer = function (parser, value, silent) {
  if (!parser.options.gfm) {
    return false
  }

  const scanner = createScanner(value)
  let subvalue = scanner.next(beginsWithProtocol)

  if (!subvalue) {
    return false
  }

  let queue = ''
  let parenCount = 0

  while (!scanner.eos()) {
    const character = scanner.next()

    if (isWhiteSpace(character) || character === '<') {
      break
    }

    if (~'.,:;"\')]'.indexOf(character)) {
      const nextCharacter = scanner.peek()

      if (
        !nextCharacter ||
        isWhiteSpace(nextCharacter)
      ) {
        break
      }
    }

    if (
      character === '(' ||
      character === '['
    ) {
      parenCount++
    }

    if (
      character === ')' ||
      character === ']'
    ) {
      parenCount--

      if (parenCount < 0) {
        break
      }
    }

    queue += character
  }

  if (!queue) {
    return false
  }

  subvalue += queue
  let content = subvalue

  if (subvalue.indexOf(MAILTO_PROTOCOL) === 0) {
    const position = queue.indexOf('@')

    if (position === -1 || position === value.length - 1) {
      return false
    }

    content = content.substr(MAILTO_PROTOCOL.length)
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  const now = parser.eat.now()

  return parser.eat(subvalue)(
    renderLink(parser, decode(subvalue), content, null, now)
  )
}

tokenizeURL.notInLink = true

/**
 * Find a possible URL.
 *
 * @example
 *   locateURL('foo http://bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible URL.
 */
tokenizeURL.locator = function locateURL (parser, value, fromIndex) {
  if (!parser.options.gfm) {
    return -1
  }

  protocolPattern.lastIndex = fromIndex

  const match = protocolPattern.exec(value)

  return !match ? -1 : match.index
}

export default tokenizeURL
