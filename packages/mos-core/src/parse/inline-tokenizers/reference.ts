import locateLink from './locators/link'
import isWhiteSpace from '../is-white-space'
import {normalizeIdentifier as normalize} from '../../utilities'
import Tokenizer from '../tokenizer'
import {NodeType, Node} from '../../node'

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
const tokenizeReference: Tokenizer = function (parser, value, silent) {
  let character = value.charAt(0)
  let index = 0
  const length = value.length
  let subvalue = ''
  let intro = ''
  let type: NodeType = 'link'
  let referenceType = REFERENCE_TYPE_SHORTCUT

  /*
   * Check whether we’re eating an image.
   */

  if (character === '!') {
    type = 'image'
    intro = character
    character = value.charAt(++index)
  }

  if (character !== '[') {
    return false
  }

  index++
  intro += character
  let queue = ''

  /*
   * Check whether we’re eating a footnote.
   */

  if (
    parser.options.footnotes &&
    type === 'link' &&
    value.charAt(index) === '^'
  ) {
    intro += '^'
    index++
    type = 'footnote'
  }

  /*
   * Eat the text.
   */

  let depth = 0
  let bracketed: boolean

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

  let text: string
  subvalue = text = queue
  character = value.charAt(index)

  if (character !== ']') {
    return false
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

  let identifier: string
  if (character !== '[') {
    if (!text) {
      return false
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
    return false
  }

  /*
   * Inline footnotes cannot have an identifier.
   */

  if (type === 'footnote' && referenceType !== REFERENCE_TYPE_SHORTCUT) {
    type = 'link'
    intro = '[^'
    text = `^${text}`
  }

  subvalue = intro + subvalue

  if (type === 'link' && parser.context.inLink) {
    return null
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  if (type === 'footnote' && text.indexOf(' ') !== -1) {
    return parser.eat(subvalue)(
      parser.tokenizeInline(text, parser.eat.now())
        .then(children => (<Node>{ type: 'footnote', children }))
    )
  }

  const now = parser.eat.now()
  now.column += intro.length
  now.offset += intro.length
  identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : text

  const node: any = {
    type: `${type}Reference`,
    identifier: normalize(identifier),
  }

  if (type === 'link' || type === 'image') {
    node.referenceType = referenceType
  }

  if (type === 'link') {
    parser.context.inLink = true
    return parser.tokenizeInline(text, now)
      .then(children => {
        node.children = children
        parser.context.inLink = false
        return parser.eat(subvalue)(node)
      })
  }

  if (type === 'image') {
    node.alt = parser.decode.raw(parser.descape(text), now) || null
    return parser.eat(subvalue)(node)
  }

  return parser.eat(subvalue)(node)
}

tokenizeReference.locator = locateLink

export default tokenizeReference
