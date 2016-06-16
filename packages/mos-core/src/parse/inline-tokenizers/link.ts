import isWhiteSpace from '../is-white-space'
import locateLink from './locators/link'
import Tokenizer from '../tokenizer'
import renderLink from './renderers/link'
const has = {}.hasOwnProperty

/*
 * A map of characters, which can be used to mark link
 * and image titles in commonmark-mode.
 */

const COMMONMARK_LINK_TITLE_MARKERS = {
  '"': '"',
  "'": "'",
  '(': ')',
}

/*
 * A map of characters, which can be used to mark link
 * and image titles.
 */

const LINK_TITLE_MARKERS = {
  '"': '"',
  "'": "'",
}

/**
 * Tokenise a link.
 *
 * @example
 *   tokenizeLink(eat, '![foo](fav.ico "Favicon"))
 *
 * @property {Function} locator - Link locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `link` or `image` node.
 */
const tokenizeLink: Tokenizer = function (parser, value, silent) {
  let subvalue = ''
  let index = 0
  let character = value.charAt(0)
  let beforeURL: string
  let beforeTitle: string
  let whiteSpaceQueue: string
  let commonmark: boolean
  let openCount: number
  let hasMarker: boolean
  let markers: any
  let isImage: boolean
  let content: string
  let marker: any
  let length: number
  let title: string
  let depth: number
  let queue: string
  let url: string
  let now: any

  /*
   * Detect whether this is an image.
   */

  if (character === '!') {
    isImage = true
    subvalue = character
    character = value.charAt(++index)
  }

  /*
   * Eat the opening.
   */

  if (character !== '[') {
    return false
  }

  /*
   * Exit when this is a link and we’re already inside
   * a link.
   */

  if (!isImage && parser.context.inLink) {
    return false
  }

  subvalue += character
  queue = ''
  index++

  /*
   * Eat the content.
   */

  commonmark = parser.options.commonmark
  length = value.length
  now = parser.eat.now()
  depth = 0

  now.column += index
  now.offset += index

  while (index < length) {
    character = value.charAt(index)

    if (character === '[') {
      depth++
    } else if (character === ']') {
      /*
       * Allow a single closing bracket when not in
       * commonmark-mode.
       */

      if (!commonmark && !depth) {
        if (value.charAt(index + 1) === '(') {
          break
        }

        depth++
      }

      if (depth === 0) {
        break
      }

      depth--
    }

    queue += character
    index++
  }

  /*
   * Eat the content closing.
   */

  if (
    value.charAt(index) !== ']' ||
    value.charAt(++index) !== '('
  ) {
    return false
  }

  subvalue += `${queue}](`
  index++
  content = queue

  /*
   * Eat white-space.
   */

  while (index < length) {
    character = value.charAt(index)

    if (!isWhiteSpace(character)) {
      break
    }

    subvalue += character
    index++
  }

  /*
   * Eat the URL.
   */

  character = value.charAt(index)
  markers = commonmark ? COMMONMARK_LINK_TITLE_MARKERS : LINK_TITLE_MARKERS
  openCount = 0
  queue = ''
  beforeURL = subvalue

  if (character === '<') {
    index++
    beforeURL += '<'

    while (index < length) {
      character = value.charAt(index)

      if (character === '>') {
        break
      }

      if (commonmark && character === '\n') {
        return false
      }

      queue += character
      index++
    }

    if (value.charAt(index) !== '>') {
      return false
    }

    subvalue += `<${queue}>`
    url = queue
    index++
  } else {
    character = null
    whiteSpaceQueue = ''

    while (index < length) {
      character = value.charAt(index)

      if (whiteSpaceQueue && has.call(markers, character)) {
        break
      }

      if (isWhiteSpace(character)) {
        if (commonmark) {
          break
        }

        whiteSpaceQueue += character
      } else {
        if (character === '(') {
          depth++
          openCount++
        } else if (character === ')') {
          if (depth === 0) {
            break
          }

          depth--
        }

        queue += whiteSpaceQueue
        whiteSpaceQueue = ''

        if (character === '\\') {
          queue += '\\'
          character = value.charAt(++index)
        }

        queue += character
      }

      index++
    }

    subvalue += queue
    url = queue
    index = subvalue.length
  }

  /*
   * Eat white-space.
   */

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
  subvalue += queue

  /*
   * Eat the title.
   */

  if (queue && has.call(markers, character)) {
    index++
    subvalue += character
    queue = ''
    marker = markers[character]
    beforeTitle = subvalue

    /*
     * In commonmark-mode, things are pretty easy: the
     * marker cannot occur inside the title.
     *
     * Non-commonmark does, however, support nested
     * delimiters.
     */

    if (commonmark) {
      while (index < length) {
        character = value.charAt(index)

        if (character === marker) {
          break
        }

        if (character === '\\') {
          queue += '\\'
          character = value.charAt(++index)
        }

        index++
        queue += character
      }

      character = value.charAt(index)

      if (character !== marker) {
        return false
      }

      title = queue
      subvalue += queue + character
      index++

      while (index < length) {
        character = value.charAt(index)

        if (!isWhiteSpace(character)) {
          break
        }

        subvalue += character
        index++
      }
    } else {
      whiteSpaceQueue = ''

      while (index < length) {
        character = value.charAt(index)

        if (character === marker) {
          if (hasMarker) {
            queue += marker + whiteSpaceQueue
            whiteSpaceQueue = ''
          }

          hasMarker = true
        } else if (!hasMarker) {
          queue += character
        } else if (character === ')') {
          subvalue += queue + marker + whiteSpaceQueue
          title = queue
          break
        } else if (isWhiteSpace(character)) {
          whiteSpaceQueue += character
        } else {
          queue += marker + whiteSpaceQueue + character
          whiteSpaceQueue = ''
          hasMarker = false
        }

        index++
      }
    }
  }

  if (value.charAt(index) !== ')') {
    return false
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  subvalue += ')'

  url = parser.decode.raw(parser.descape(url), parser.eat(beforeURL).test().end)

  if (title) {
    const beforeTitleNode = parser.eat(beforeTitle).test().end
    title = parser.decode.raw(parser.descape(title), beforeTitleNode)
  }

  if (isImage) {
    return parser.eat(subvalue)({
      type: 'image',
      title: title || null,
      url,
      alt: content
        ? parser.decode.raw(parser.descape(content), now)
        : null
    })
  }

  return parser.eat(subvalue)(
    renderLink(parser, url, content, title, now)
  )
}

tokenizeLink.locator = locateLink

export default tokenizeLink
