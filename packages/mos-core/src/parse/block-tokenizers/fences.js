import renderCodeBlock from './renderers/code-block'

const MIN_FENCE_COUNT = 3
const CODE_INDENT_LENGTH = 4

/**
 * Tokenise a fenced code block.
 *
 * @example
 *   tokenizeFences(eat, '```js\nfoo()\n```')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `code` node.
 */
export default function tokenizeFences (parser, value, silent) {
  const settings = parser.options
  const length = value.length + 1
  let index = 0
  let subvalue = ''
  let fenceCount
  let marker
  let character
  let flag
  let queue
  let content
  let exdentedContent
  let closing
  let exdentedClosing
  let indent
  let now

  if (!settings.gfm) {
    return
  }

  /*
   * Eat initial spacing.
   */

  while (index < length) {
    character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    subvalue += character
    index++
  }

  indent = index // TODO: CHECK.

  /*
   * Eat the fence.
   */

  character = value.charAt(index)

  if (character !== '~' && character !== '`') {
    return
  }

  index++
  marker = character
  fenceCount = 1
  subvalue += character

  while (index < length) {
    character = value.charAt(index)

    if (character !== marker) {
      break
    }

    subvalue += character
    fenceCount++
    index++
  }

  if (fenceCount < MIN_FENCE_COUNT) {
    return
  }

  /*
   * Eat spacing before flag.
   */

  while (index < length) {
    character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    subvalue += character
    index++
  }

  /*
   * Eat flag.
   */

  flag = queue = ''

  while (index < length) {
    character = value.charAt(index)

    if (
      character === '\n' ||
      character === '~' ||
      character === '`'
    ) {
      break
    }

    if (character === ' ' || character === '\t') {
      queue += character
    } else {
      flag += queue + character
      queue = ''
    }

    index++
  }

  character = value.charAt(index)

  if (character && character !== '\n') {
    return
  }

  if (silent) {
    return true
  }

  now = parser.eat.now()
  now.column += subvalue.length
  now.offset += subvalue.length

  subvalue += flag
  flag = parser.decode.raw(parser.descape(flag), now)

  if (queue) {
    subvalue += queue
  }

  queue = closing = exdentedClosing = content = exdentedContent = ''

  /*
   * Eat content.
   */

  while (index < length) {
    character = value.charAt(index)
    content += closing
    exdentedContent += exdentedClosing
    closing = exdentedClosing = ''

    if (character !== '\n') {
      content += character
      exdentedClosing += character
      index++
      continue
    }

    /*
     * Add the newline to `subvalue` if its the first
     * character. Otherwise, add it to the `closing`
     * queue.
     */

    if (!content) {
      subvalue += character
    } else {
      closing += character
      exdentedClosing += character
    }

    queue = ''
    index++

    while (index < length) {
      character = value.charAt(index)

      if (character !== ' ') {
        break
      }

      queue += character
      index++
    }

    closing += queue
    exdentedClosing += queue.slice(indent)

    if (queue.length >= CODE_INDENT_LENGTH) {
      continue
    }

    queue = ''

    while (index < length) {
      character = value.charAt(index)

      if (character !== marker) {
        break
      }

      queue += character
      index++
    }

    closing += queue
    exdentedClosing += queue

    if (queue.length < fenceCount) {
      continue
    }

    queue = ''

    while (index < length) {
      character = value.charAt(index)

      if (character !== ' ' && character !== '\t') {
        break
      }

      closing += character
      exdentedClosing += character
      index++
    }

    if (!character || character === '\n') {
      break
    }
  }

  subvalue += content + closing

  return parser.eat(subvalue)(renderCodeBlock(exdentedContent, flag))
}
