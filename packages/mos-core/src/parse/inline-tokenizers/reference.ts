import locateLink from './locators/link'
import isWhiteSpace from '../is-white-space'
import {normalizeIdentifier as normalize} from '../../utilities'
import Tokenizer from '../tokenizer'
import {NodeType, Node} from '../../node'
import createScanner from '../scanner'

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
  const scanner = createScanner(value)
  let character = scanner.next()
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
    character = scanner.next()
  }

  if (character !== '[') {
    return false
  }

  intro += character
  let queue = ''

  /*
   * Check whether we’re eating a footnote.
   */

  if (
    parser.options.footnotes &&
    type === 'link' &&
    scanner.next('^', 1)
  ) {
    intro += '^'
    type = 'footnote'
  }

  /*
   * Eat the text.
   */

  let depth = 0
  let bracketed: boolean

  while (!scanner.eos()) {
    character = scanner.next()

    if (character === '[') {
      bracketed = true
      depth++
    } else if (character === ']') {
      if (!depth) {
        scanner.moveIndex(-1)
        break
      }

      depth--
    }

    if (character === '\\') {
      queue += '\\'
      character = scanner.next()
    }

    queue += character
  }

  let text: string
  subvalue = text = queue
  character = scanner.next()

  if (character !== ']') {
    return false
  }

  subvalue += character
  queue = ''

  while (!scanner.eos()) {
    character = scanner.next()

    if (!isWhiteSpace(character)) {
      scanner.moveIndex(-1)
      break
    }

    queue += character
  }

  character = scanner.next()

  let identifier: string
  if (character !== '[') {
    if (!text) {
      return false
    }

    identifier = text
  } else {
    identifier = ''
    queue += character

    while (!scanner.eos()) {
      character = scanner.next()

      if (
        character === '[' ||
        character === ']'
      ) {
        scanner.moveIndex(-1)
        break
      }

      if (character === '\\') {
        identifier += '\\'
        character = scanner.next()
      }

      identifier += character
    }

    character = scanner.next()

    if (character === ']') {
      queue += identifier + character

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
