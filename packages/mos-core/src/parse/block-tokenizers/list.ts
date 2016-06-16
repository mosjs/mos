import {ListNode, Location, ListItemNode} from '../../node'
import isNumeric from '../is-numeric'
import Tokenizer from '../tokenizer'
import {Parser} from '../parser'

import {TAB_SIZE, ruleMarkers} from '../shared-constants'

/*
 * A set of characters which can be used to mark
 * list-items.
 */

const listUnorderedMarkers = new Set(['*', '+', '-'])

/*
 * A set of characters which can be used to mark
 * list-items after a digit.
 */

const listOrderedMarkers = new Set(['.'])

/*
 * A set of characters which can be used to mark
 * list-items after a digit.
 */

const listOrderedCommonmarkMarkers = new Set(['.', ')'])

/**
 * Tokenise a list.
 *
 * @example
 *   tokenizeList(eat, '- Foo')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `list` node.
 */
const tokenizeList: Tokenizer = function (parser, value, silent) {
  const commonmark = parser.options.commonmark
  const pedantic = parser.options.pedantic
  let index = 0
  let length = value.length
  let start: number = null
  let queue: string
  let ordered: boolean
  let character: string
  let marker: string
  let nextIndex: number
  let startIndex: number
  let prefixed: boolean
  let currentMarker: string
  let empty: boolean
  let allLines: any

  while (index < length) {
    character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    index++
  }

  character = value.charAt(index)

  const markers = commonmark
    ? listOrderedCommonmarkMarkers
    : listOrderedMarkers

  if (listUnorderedMarkers.has(character)) {
    marker = character
    ordered = false
  } else {
    ordered = true
    queue = ''

    while (index < length) {
      character = value.charAt(index)

      if (!isNumeric(character)) {
        break
      }

      queue += character
      index++
    }

    character = value.charAt(index)

    if (!queue || !markers.has(character)) {
      return
    }

    start = parseInt(queue, 10)
    marker = character
  }

  character = value.charAt(++index)

  if (character !== ' ' && character !== '\t') {
    return
  }

  if (silent) {
    return true
  }

  index = 0
  const items: any = []
  allLines = []
  let emptyLines: string[] = []
  let item: any

  return tokenizeEach(index)
    .then(() => parser.eat(allLines.join('\n'))
      .reset({
        type: 'list',
        ordered,
        start,
        loose: null,
        children: [],
      })
    )
    .then((node: ListNode) => {
      parser.context.atTop = false
      parser.context.inBlockquote = true
      let isLoose = false
      length = items.length
      const parent = node

      return tokenizeEach(items)
        .then(() => {
          parser.context.atTop = true
          parser.context.inBlockquote = false

          node.loose = isLoose

          return node
        })

      function tokenizeEach (items: any): any {
        const rawItem = items.shift()
        if (!rawItem) return
        item = rawItem.value.join('\n')
        const now = parser.eat.now()

        return parser.eat(item)(renderListItem(parser, item, now), parent)
          .then(item => {
            if ((item as ListNode).loose) {
              isLoose = true
            }

            let joinedTrail = rawItem.trail.join('\n')

            if (items.length) {
              joinedTrail += '\n'
            }

            parser.eat(joinedTrail)

            return tokenizeEach(items)
          })
      }
    })

  function tokenizeEach (index: number): any {
    if (index >= length) return Promise.resolve()

    nextIndex = value.indexOf('\n', index)
    startIndex = index
    prefixed = false
    let indented = false

    if (nextIndex === -1) {
      nextIndex = length
    }

    let end = index + TAB_SIZE
    let size = 0

    while (index < length) {
      character = value.charAt(index)

      if (character === '\t') {
        size += TAB_SIZE - size % TAB_SIZE
      } else if (character === ' ') {
        size++
      } else {
        break
      }

      index++
    }

    if (size >= TAB_SIZE) {
      indented = true
    }

    if (item && size >= item.indent) {
      indented = true
    }

    character = value.charAt(index)
    currentMarker = null

    if (!indented) {
      if (listUnorderedMarkers.has(character)) {
        currentMarker = character
        index++
        size++
      } else {
        queue = ''

        while (index < length) {
          character = value.charAt(index)

          if (!isNumeric(character)) {
            break
          }

          queue += character
          index++
        }

        character = value.charAt(index)
        index++

        if (queue && markers.has(character)) {
          currentMarker = character
          size += queue.length + 1
        }
      }

      if (currentMarker) {
        character = value.charAt(index)

        if (character === '\t') {
          size += TAB_SIZE - size % TAB_SIZE
          index++
        } else if (character === ' ') {
          end = index + TAB_SIZE

          while (index < end) {
            if (value.charAt(index) !== ' ') {
              break
            }

            index++
            size++
          }

          if (index === end && value.charAt(index) === ' ') {
            index -= TAB_SIZE - 1
            size -= TAB_SIZE - 1
          }
        } else if (
          character !== '\n' &&
          character !== ''
        ) {
          currentMarker = null
        }
      }
    }

    if (currentMarker) {
      if (commonmark && marker !== currentMarker) {
        return Promise.resolve()
      }

      prefixed = true
    } else {
      if (
        !commonmark &&
        !indented &&
        value.charAt(startIndex) === ' '
      ) {
        indented = true
      } else if (
        commonmark &&
        item
      ) {
        indented = size >= item.indent || size > TAB_SIZE
      }

      prefixed = false
      index = startIndex
    }

    let line = value.slice(startIndex, nextIndex)
    let content = startIndex === index ? line : value.slice(index, nextIndex)

    if (currentMarker && ruleMarkers.has(currentMarker)) {
      return parser.tryTokenizeBlock(parser.eat, 'thematicBreak', line, true)
        .then(found => {
          if (found) {
            return
          }
          return notRuleMarker()
        })
    }

    return notRuleMarker()

    function defaultEnd () {
      index = nextIndex + 1
      return tokenizeEach(index)
    }

    function next () {
      item.value = item.value.concat(emptyLines, line)
      allLines = allLines.concat(emptyLines, line)
      emptyLines = []

      return defaultEnd()
    }

    function notCommonmarkNext () {
      if (!commonmark) {
        return parser.tryTokenizeBlock(parser.eat, 'definition', line, true)
          .then(found => {
            if (found) return

            return parser.tryTokenizeBlock(parser.eat, 'footnoteDefinition', line, true)
              .then(found => {
                if (found) return

                return next()
              })
          })
      }

      return next()
    }

    function notRuleMarker () {
      const prevEmpty = empty
      empty = !content.trim().length

      if (indented && item) {
        item.value = item.value.concat(emptyLines, line)
        allLines = allLines.concat(emptyLines, line)
        emptyLines = []
      } else if (prefixed) {
        if (emptyLines.length) {
          item.value.push('')
          item.trail = emptyLines.concat()
        }

        item = {
          // 'bullet': value.slice(startIndex, index),
          value: [line],
          indent: size,
          trail: [],
        }

        items.push(item)
        allLines = allLines.concat(emptyLines, line)
        emptyLines = []
      } else if (empty) {
        // TODO: disable when in pedantic-mode.
        if (prevEmpty) {
          return Promise.resolve()
        }

        emptyLines.push(line)
      } else {
        if (prevEmpty) {
          return Promise.resolve()
        }

        if (!pedantic) {
          return parser.tryTokenizeBlock(parser.eat, 'fences', line, true)
            .then(found => {
              if (found) return

              return parser.tryTokenizeBlock(parser.eat, 'thematicBreak', line, true)
                .then(found => {
                  if (found) return

                  return notCommonmarkNext()
                })
            })
        }

        return notCommonmarkNext()
      }

      return defaultEnd()
    }
  }
}

export default tokenizeList

/*
 * A map of two functions which can create list items.
 */

const LIST_ITEM_MAP = {
  true: renderPedanticListItem,
  false: renderNormalListItem,
}

const EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/
const EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/
const EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/
const EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm

/**
 * Create a list-item using overly simple mechanics.
 *
 * @example
 *   renderPedanticListItem('- _foo_', now())
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
function renderPedanticListItem (parser: Parser, value: string, position: Location): string {
  let indent = parser.indent(position.line)

  /**
   * A simple replacer which removed all matches,
   * and adds their length to `offset`.
   *
   * @param {string} $0 - Indentation to subtract.
   * @return {string} - An empty string.
   */
  function replacer ($0: string): string {
    indent($0.length)

    return ''
  }

  /*
   * Remove the list-item’s bullet.
   */

  value = value.replace(EXPRESSION_PEDANTIC_BULLET, replacer)

  /*
   * The initial line was also matched by the below, so
   * we reset the `line`.
   */

  indent = parser.indent(position.line)

  return value.replace(EXPRESSION_INITIAL_INDENT, replacer)
}

/*
 * Numeric constants.
 */

const SPACE_SIZE = 1

/*
 * A map of characters, and their column length,
 * which can be used as indentation.
 */

const INDENTATION_CHARACTERS = {
  ' ': SPACE_SIZE,
  '\t': TAB_SIZE,
}

type Stops = { [stop: number]: number }
type IndentInfo = { indent: number, stops: Stops }

/**
 * Gets indentation information for a line.
 *
 * @example
 *   getIndent('  foo')
 *   // {indent: 2, stops: {1: 0, 2: 1}}
 *
 *   getIndent('\tfoo')
 *   // {indent: 4, stops: {4: 0}}
 *
 *   getIndent('  \tfoo')
 *   // {indent: 4, stops: {1: 0, 2: 1, 4: 2}}
 *
 *   getIndent('\t  foo')
 *   // {indent: 6, stops: {4: 0, 5: 1, 6: 2}}
 *
 * @param {string} value - Indented line.
 * @return {Object} - Indetation information.
 */
function getIndent (value: string): IndentInfo {
  let index = 0
  let indent = 0
  let character = value.charAt(index)
  const stops: Stops = {}

  while (character in INDENTATION_CHARACTERS) {
    const size = INDENTATION_CHARACTERS[character]

    indent += size

    if (size > 1) {
      indent = Math.floor(indent / size) * size
    }

    stops[indent] = index

    character = value.charAt(++index)
  }

  return { indent, stops }
}

/**
 * Remove the minimum indent from every line in `value`.
 * Supports both tab, spaced, and mixed indentation (as
 * well as possible).
 *
 * @example
 *   removeIndentation('  foo') // 'foo'
 *   removeIndentation('    foo', 2) // '  foo'
 *   removeIndentation('\tfoo', 2) // '  foo'
 *   removeIndentation('  foo\n bar') // ' foo\n bar'
 *
 * @param {string} value - Value to trim.
 * @param {number?} [maximum] - Maximum indentation
 *   to remove.
 * @return {string} - Unindented `value`.
 */
function removeIndentation (value: string, maximum?: number): string {
  const values = value.split('\n')
  let position = values.length + 1
  let minIndent = Infinity
  const matrix: { [position: number]: Stops } = []
  let index: number
  let stops: Stops
  let padding: string

  values.unshift(`${' '.repeat(maximum)}!`)

  while (position--) {
    const indentation = getIndent(values[position])

    matrix[position] = indentation.stops

    if (values[position].trim().length === 0) {
      continue
    }

    if (indentation.indent) {
      if (indentation.indent > 0 && indentation.indent < minIndent) {
        minIndent = indentation.indent
      }
    } else {
      minIndent = Infinity

      break
    }
  }

  if (minIndent !== Infinity) {
    position = values.length

    while (position--) {
      stops = matrix[position]
      index = minIndent

      while (index && !(index in stops)) {
        index--
      }

      if (
        values[position].trim().length !== 0 &&
        minIndent &&
        index !== minIndent
      ) {
        padding = '\t'
      } else {
        padding = ''
      }

      values[position] = padding + values[position].slice(
        index in stops ? stops[index] + 1 : 0
      )
    }
  }

  values.shift()

  return values.join('\n')
}

/**
 * Create a list-item using sane mechanics.
 *
 * @example
 *   renderNormalListItem('- _foo_', now())
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
function renderNormalListItem (parser: Parser, value: string, position: Location): string {
  const indent = parser.indent(position.line)
  let max: string
  let bullet: string
  let rest: string
  let lines: string[]
  let trimmedLines: string[]
  let index: number
  let length: number

  /*
   * Remove the list-item’s bullet.
   */

  value = value.replace(EXPRESSION_BULLET, ($0: string, $1: string, $2: string, $3: string, $4: string): string => {
    bullet = $1 + $2 + $3
    rest = $4

    /*
     * Make sure that the first nine numbered list items
     * can indent with an extra space.  That is, when
     * the bullet did not receive an extra final space.
     */

    if (Number($2) < 10 && bullet.length % 2 === 1) {
      $2 = ` ${$2}`
    }

    max = $1 + ' '.repeat($2.length) + $3

    return max + rest
  })

  lines = value.split('\n')

  trimmedLines = removeIndentation(
    value, getIndent(max).indent
  ).split('\n')

  /*
   * We replaced the initial bullet with something
   * else above, which was used to trick
   * `removeIndentation` into removing some more
   * characters when possible. However, that could
   * result in the initial line to be stripped more
   * than it should be.
   */

  trimmedLines[0] = rest

  indent(bullet.length)

  index = 0
  length = lines.length

  while (++index < length) {
    indent(lines[index].length - trimmedLines[index].length)
  }

  return trimmedLines.join('\n')
}

const EXPRESSION_TASK_ITEM = /^\[([ \t]|x|X)\][ \t]/

/**
 * Create a list-item node.
 *
 * @example
 *   renderListItem('- _foo_', now())
 *
 * @param {Object} value - List-item.
 * @param {Object} position - List-item location.
 * @return {Object} - `listItem` node.
 */
function renderListItem (parser: Parser, value: string, position: Location): Promise<ListItemNode> {
  let checked: boolean = null

  value = LIST_ITEM_MAP[parser.options.pedantic ? 'true' : 'false'].apply(parser, arguments)

  if (parser.options.gfm) {
    const task = value.match(EXPRESSION_TASK_ITEM)

    if (task) {
      const indent = task[0].length
      checked = task[1].toLowerCase() === 'x'

      parser.indent(position.line)(indent)
      value = value.slice(indent)
    }
  }

  return parser.tokenizeBlock(value, position)
    .then(children => (<ListItemNode>{
      type: 'listItem',
      loose: EXPRESSION_LOOSE_LIST_ITEM.test(value) ||
        value.charAt(value.length - 1) === '\n',
      checked,
      children,
    }))
}
