export default tokenizeReference
import locateLink from './locators/link'
import nodeTypes from '../node-types'
import isWhiteSpace from '../is-white-space'
import {normalizeIdentifier as normalize} from '../../utilities.js'

/*
 * Available reference types.
 */

const REFERENCE_TYPE_SHORTCUT = 'shortcut'
const REFERENCE_TYPE_COLLAPSED = 'collapsed'
const REFERENCE_TYPE_FULL = 'full'

/**
 * Tokenise a reference link, image, or footnote
 * shortcut reference link, or footnote.
 *
 * @example
 *   tokenizeReference(eat, '[foo]')
 *   tokenizeReference(eat, '[foo][]')
 *   tokenizeReference(eat, '[foo][bar]')
 *
 * @property {Function} locator - Reference locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - Reference node.
 */
function tokenizeReference (parser, value, silent) {
  let character = value.charAt(0)
  let index = 0
  const length = value.length
  let subvalue = ''
  let intro = ''
  let type = nodeTypes.LINK
  let referenceType = REFERENCE_TYPE_SHORTCUT

  /*
   * Check whether we’re eating an image.
   */

  if (character === '!') {
    type = nodeTypes.IMAGE
    intro = character
    character = value.charAt(++index)
  }

  if (character !== '[') {
    return
  }

  index++
  intro += character
  let queue = ''

  /*
   * Check whether we’re eating a footnote.
   */

  if (
    parser.options.footnotes &&
    type === nodeTypes.LINK &&
    value.charAt(index) === '^'
  ) {
    intro += '^'
    index++
    type = nodeTypes.FOOTNOTE
  }

  /*
   * Eat the text.
   */

  let depth = 0
  let bracketed

  while (index < length) {
    character = value.charAt(index)

    if (character === '[') {
      bracketed = true
      depth++
    } else if (character === ']') {
      if (!depth) {
        break
      }

      depth--
    }

    if (character === '\\') {
      queue += '\\'
      character = value.charAt(++index)
    }

    queue += character
    index++
  }

  let text
  subvalue = text = queue
  character = value.charAt(index)

  if (character !== ']') {
    return
  }

  index++
  subvalue += character
  queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (!isWhiteSpace(character)) {
      break
    }

    queue += character
    index++
  }

  character = value.charAt(index)

  let identifier
  if (character !== '[') {
    if (!text) {
      return
    }

    identifier = text
  } else {
    identifier = ''
    queue += character
    index++

    while (index < length) {
      character = value.charAt(index)

      if (
        character === '[' ||
        character === ']'
      ) {
        break
      }

      if (character === '\\') {
        identifier += '\\'
        character = value.charAt(++index)
      }

      identifier += character
      index++
    }

    character = value.charAt(index)

    if (character === ']') {
      queue += identifier + character
      index++

      referenceType = identifier
        ? REFERENCE_TYPE_FULL
        : REFERENCE_TYPE_COLLAPSED
    } else {
      identifier = ''
    }

    subvalue += queue
    queue = ''
  }

  /*
   * Brackets cannot be inside the identifier.
   */

  if (referenceType !== REFERENCE_TYPE_FULL && bracketed) {
    return
  }

  /*
   * Inline footnotes cannot have an identifier.
   */

  if (type === nodeTypes.FOOTNOTE && referenceType !== REFERENCE_TYPE_SHORTCUT) {
    type = nodeTypes.LINK
    intro = '[^'
    text = `^${text}`
  }

  subvalue = intro + subvalue

  if (type === nodeTypes.LINK && parser.state.inLink) {
    return null
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  if (type === nodeTypes.FOOTNOTE && text.indexOf(' ') !== -1) {
    return parser.eat(subvalue)(parser.renderFootnote(text, parser.eat.now()))
  }

  const now = parser.eat.now()
  now.column += intro.length
  now.offset += intro.length
  identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : text

  const node = {
    type: `${type}Reference`,
    identifier: normalize(identifier),
  }

  if (type === nodeTypes.LINK || type === nodeTypes.IMAGE) {
    node.referenceType = referenceType
  }

  if (type === nodeTypes.LINK) {
    const exitLink = parser.state.enterLink()
    return parser.tokenizeInline(text, now)
      .then(children => {
        node.children = children
        exitLink()
        return parser.eat(subvalue)(node)
      })
  }

  if (type === nodeTypes.IMAGE) {
    node.alt = parser.decode.raw(parser.descape(text), now) || null
    return parser.eat(subvalue)(node)
  }

  return parser.eat(subvalue)(node)
}

tokenizeReference.locator = locateLink
