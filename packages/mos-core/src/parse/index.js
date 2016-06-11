import decode from 'parse-entities'
import repeat from 'repeat-string'
import trim from 'trim'
import VFile from 'vfile'
import vfileLocation from 'vfile-location'
import removePosition from 'unist-util-remove-position'
import {raise, clean, validate, stateToggler} from '../utilities'
import {parse as defaultOptions} from '../defaults'
import tokenizeFactory from './tokenize-factory'

/*
 * Numeric constants.
 */

const SPACE_SIZE = 1
const TAB_SIZE = 4

/*
 * Expressions.
 */

const EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/
const EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/
const EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm
const EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/
const EXPRESSION_TASK_ITEM = /^\[([ \t]|x|X)\][ \t]/

import nodeTypes from './node-types'

/*
 * A map of characters, and their column length,
 * which can be used as indentation.
 */

const INDENTATION_CHARACTERS = {}

INDENTATION_CHARACTERS[' '] = SPACE_SIZE
INDENTATION_CHARACTERS['\t'] = TAB_SIZE

/**
 * Factory to create an entity decoder.
 *
 * @param {Object} context - Context to attach to, e.g.,
 *   a parser.
 * @return {Function} - See `decode`.
 */
function decodeFactory (context) {
  /**
   * Normalize `position` to add an `indent`.
   *
   * @param {Position} position - Reference
   * @return {Position} - Augmented with `indent`.
   */
  function normalize (position) {
    return {
      start: position,
      indent: context.getIndent(position.line),
    }
  }

  /**
   * Handle a warning.
   *
   * @this {VFile} - Virtual file.
   * @param {string} reason - Reason for warning.
   * @param {Position} position - Place of warning.
   * @param {number} code - Code for warning.
   */
  function handleWarning (reason, position, code) {
    if (code === 3) {
      return
    }

    context.file.warn(reason, position)
  }

  /**
   * Decode `value` (at `position`) into text-nodes.
   *
   * @param {string} value - Value to parse.
   * @param {Position} position - Position to start parsing at.
   * @param {Function} handler - Node handler.
   */
  function decoder (value, position, handler) {
    decode(value, {
      position: normalize(position),
      warning: handleWarning,
      text: handler,
      reference: handler,
      textContext: context,
      referenceContext: context,
    })
  }

  /**
   * Decode `value` (at `position`) into a string.
   *
   * @param {string} value - Value to parse.
   * @param {Position} position - Position to start
   *   parsing at.
   * @return {string} - Plain-text.
   */
  function decodeRaw (value, position) {
    return decode(value, {
      position: normalize(position),
      warning: handleWarning,
    })
  }

  decoder.raw = decodeRaw

  return decoder
}

/**
 * Factory to de-escape a value, based on a list at `key`
 * in `scope`.
 *
 * @example
 *   var scope = {escape: ['a']}
 *   var descape = descapeFactory(scope, 'escape')
 *
 * @param {Object} scope - List of escapable characters.
 * @param {string} key - Key in `map` at which the list
 *   exists.
 * @return {function(string): string} - Function which
 *   takes a value and returns its unescaped version.
 */
function descapeFactory (scope, key) {
  /**
   * De-escape a string using the expression at `key`
   * in `scope`.
   *
   * @example
   *   var scope = {escape: ['a']}
   *   var descape = descapeFactory(scope, 'escape')
   *   descape('\a \b') // 'a \b'
   *
   * @param {string} value - Escaped string.
   * @return {string} - Unescaped string.
   */
  function descape (value) {
    let prev = 0
    let index = value.indexOf('\\')
    const escape = scope[key]
    const queue = []
    let character

    while (index !== -1) {
      queue.push(value.slice(prev, index))
      prev = index + 1
      character = value.charAt(prev)

      /*
       * If the following character is not a valid escape,
       * add the slash.
       */

      if (!character || escape.indexOf(character) === -1) {
        queue.push('\\')
      }

      index = value.indexOf('\\', prev)
    }

    queue.push(value.slice(prev))

    return queue.join('')
  }

  return descape
}

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
function getIndent (value) {
  let index = 0
  let indent = 0
  let character = value.charAt(index)
  const stops = {}
  let size

  while (character in INDENTATION_CHARACTERS) {
    size = INDENTATION_CHARACTERS[character]

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
function removeIndentation (value, maximum) {
  const values = value.split('\n')
  let position = values.length + 1
  let minIndent = Infinity
  const matrix = []
  let index
  let indentation
  let stops
  let padding

  values.unshift(`${repeat(' ', maximum)}!`)

  while (position--) {
    indentation = getIndent(values[position])

    matrix[position] = indentation.stops

    if (trim(values[position]).length === 0) {
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
        trim(values[position]).length !== 0 &&
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
 * Construct a new parser.
 *
 * @example
 *   var parser = new Parser(new VFile('Foo'))
 *
 * @constructor
 * @class {Parser}
 * @param {VFile} file - File to parse.
 * @param {Object?} [options] - Passed to
 *   `Parser#setOptions()`.
 */
function parserFactory (processor) {
  /*
   * A map of two functions which can create list items.
   */

  const LIST_ITEM_MAP = {}

  LIST_ITEM_MAP.true = renderPedanticListItem
  LIST_ITEM_MAP.false = renderNormalListItem

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
  function renderPedanticListItem (value, position) {
    let indent = parser.indent(position.line)

    /**
     * A simple replacer which removed all matches,
     * and adds their length to `offset`.
     *
     * @param {string} $0 - Indentation to subtract.
     * @return {string} - An empty string.
     */
    function replacer ($0) {
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
  function renderNormalListItem (value, position) {
    const indent = parser.indent(position.line)
    let max
    let bullet
    let rest
    let lines
    let trimmedLines
    let index
    let length

    /*
     * Remove the list-item’s bullet.
     */

    value = value.replace(EXPRESSION_BULLET, ($0, $1, $2, $3, $4) => {
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

      max = $1 + repeat(' ', $2.length) + $3

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

  var parser = {
    /**
     * Set options.  Does not overwrite previously set
     * options.
     *
     * @example
     *   var parser = new Parser()
     *   parser.setOptions({gfm: true})
     *
     * @this {Parser}
     * @throws {Error} - When an option is invalid.
     * @param {Object?} [options] - Parse settings.
     * @return {Parser} - `parser`.
     */
    setOptions (options) {
      const escape = parser.data.escape
      const current = parser.options
      let key

      if (options === null || options === undefined) {
        options = {}
      } else if (typeof options === 'object') {
        options = Object.assign({}, options)
      } else {
        raise(options, 'options')
      }

      for (key in defaultOptions) {
        validate.boolean(options, key, current[key])
      }

      parser.options = options

      if (options.commonmark) {
        parser.escape = escape.commonmark
      } else if (options.gfm) {
        parser.escape = escape.gfm
      } else {
        parser.escape = escape.default
      }

      return parser
    },

    /**
     * Factory to track indentation for each line corresponding
     * to the given `start` and the number of invocations.
     *
     * @param {number} start - Starting line.
     * @return {function(offset)} - Indenter.
     */
    indent (start) {
      let line = start

      /**
       * Intender which increments the global offset,
       * starting at the bound line, and further incrementing
       * each line for each invocation.
       *
       * @example
       *   indenter(2)
       *
       * @param {number} offset - Number to increment the
       *   offset.
       */
      function indenter (offset) {
        parser.offset[line] = (parser.offset[line] || 0) + offset

        line++
      }

      return indenter
    },

    /**
     * Get found offsets starting at `start`.
     *
     * @param {number} start - Starting line.
     * @return {Array.<number>} - Offsets starting at `start`.
     */
    getIndent (start) {
      const offset = parser.offset
      const result = []

      while (++start) {
        if (!(start in offset)) {
          break
        }

        result.push((offset[start] || 0) + 1)
      }

      return result
    },

    /**
     * Parse the bound file.
     *
     * @example
     *   new Parser(new File('_Foo_.')).parse()
     *
     * @this {Parser}
     * @return {Object} - `root` node.
     */
    parse (contents, opts) {
      parser.setOptions(opts)

      const file = contents instanceof VFile ? contents : new VFile(contents)
      const value = clean(String(file))
      parser.file = file
      parser.toOffset = vfileLocation(file).toOffset

      /*
       * Add an `offset` matrix, used to keep track of
       * syntax and white space indentation per line.
       */

      parser.offset = {}

      return parser.tokenizeBlock(value)
        .then(children => {
          const node = {
            type: nodeTypes.ROOT,
            children,
            position: {
              start: {
                line: 1,
                column: 1,
                offset: 0,
              },
            },
          }

          node.position.end = parser.eof || Object.assign({}, node.position.start)

          if (!parser.options.position) {
            removePosition(node)
          }

          return node
        })
    },

    /**
     * Create a blockquote node.
     *
     * @example
     *   renderBlockquote('_foo_', eat)
     *
     * @param {string} value - Content.
     * @param {Object} now - Position.
     * @return {Object} - `blockquote` node.
     */
    renderBlockquote (value, now) {
      const exitBlockquote = parser.state.enterBlockquote()

      return parser.tokenizeBlock(value, now)
        .then(children => {
          exitBlockquote()
          return {
            type: nodeTypes.BLOCKQUOTE,
            children,
          }
        })
    },

    /**
     * Create a link node.
     *
     * @example
     *   renderLink(true, 'example.com', 'example', 'Example Domain', now(), eat)
     *   renderLink(false, 'fav.ico', 'example', 'Example Domain', now(), eat)
     *
     * @param {boolean} isLink - Whether linking to a document
     *   or an image.
     * @param {string} url - URI reference.
     * @param {string} text - Content.
     * @param {string?} title - Title.
     * @param {Object} position - Location of link.
     * @return {Object} - `link` or `image` node.
     */
    renderLink (isLink, url, text, title, position) {
      const exitLink = parser.state.enterLink()
      let node

      node = {
        type: isLink ? nodeTypes.LINK : nodeTypes.IMAGE,
        title: title || null,
      }

      if (isLink) {
        node.url = url
        return parser.tokenizeInline(text, position)
          .then(children => {
            exitLink()
            node.children = children
            return node
          })
      }
      node.url = url
      node.alt = text
        ? parser.decode.raw(parser.descape(text), position)
        : null
      exitLink()
      return Promise.resolve(node)
    },

    /**
     * Create a footnote node.
     *
     * @example
     *   renderFootnote('_foo_', now())
     *
     * @param {string} value - Contents.
     * @param {Object} position - Location of footnote.
     * @return {Object} - `footnote` node.
     */
    renderFootnote (value, position) {
      return parser.renderInline(nodeTypes.FOOTNOTE, value, position)
    },

    /**
     * Add a node with inline content.
     *
     * @example
     *   renderInline('strong', '_foo_', now())
     *
     * @param {string} type - Node type.
     * @param {string} value - Contents.
     * @param {Object} position - Location of node.
     * @return {Object} - Node of type `type`.
     */
    renderInline (type, value, position) {
      return parser.tokenizeInline(value, position)
        .then(children => ({
          type,
          children,
        }))
    },

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
    renderListItem (value, position) {
      let checked = null

      value = LIST_ITEM_MAP[parser.options.pedantic].apply(parser, arguments)

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
        .then(children => ({
          type: nodeTypes.LIST_ITEM,
          loose: EXPRESSION_LOOSE_LIST_ITEM.test(value) ||
            value.charAt(value.length - 1) === '\n',
          checked,
          children,
        }))
    },

    /**
     * Create a footnote-definition node.
     *
     * @example
     *   renderFootnoteDefinition('1', '_foo_', now())
     *
     * @param {string} identifier - Unique reference.
     * @param {string} value - Contents
     * @param {Object} position - Definition location.
     * @return {Object} - `footnoteDefinition` node.
     */
    renderFootnoteDefinition (identifier, value, position) {
      const exitBlockquote = parser.state.enterBlockquote()

      return parser.tokenizeBlock(value, position)
        .then(children => {
          exitBlockquote()
          return {
            type: nodeTypes.FOOTNOTE_DEFINITION,
            identifier,
            children,
          }
        })
    },

    /**
     * Create a heading node.
     *
     * @example
     *   renderHeading('_foo_', 1, now())
     *
     * @param {string} value - Content.
     * @param {number} depth - Heading depth.
     * @param {Object} position - Heading content location.
     * @return {Object} - `heading` node
     */
    renderHeading (value, depth, position) {
      return parser.tokenizeInline(value, position)
        .then(children => ({
          type: nodeTypes.HEADING,
          depth,
          children,
        }))
    },

    /*
     * Expose tokenizers for block-level nodes.
     */

    blockTokenizers: processor.blockTokenizers,

    /*
     * Expose tokenizers for inline-level nodes.
     */

    inlineTokenizers: processor.inlineTokenizers,

    data: processor.data,

    /*
     * Expose `defaults`.
     */
    options: Object.assign({}, defaultOptions),
  }

  /*
   * Enter and exit helpers.
   */

  parser.state = {
    inLink: false,
    atTop: true,
    atStart: true,
    inBlockquote: false,
  }

  parser.state.enterLink = stateToggler(parser.state, 'inLink', false)
  parser.state.exitTop = stateToggler(parser.state, 'atTop', true)
  parser.state.exitStart = stateToggler(parser.state, 'atStart', true)
  parser.state.enterBlockquote = stateToggler(parser.state, 'inBlockquote', false)

  /*
   * Expose `tokenizeFactory` so dependencies could create
   * their own tokenizers.
   */

  parser.tokenizeFactory = type => tokenizeFactory(parser, type)

  /**
   * Block tokenizer.
   *
   * @example
   *   var parser = new Parser()
   *   parser.tokenizeBlock('> foo.')
   *
   * @param {string} value - Content.
   * @return {Array.<Object>} - Nodes.
   */
  parser.tokenizeBlock = parser.tokenizeFactory('block')

  /**
   * Inline tokenizer.
   *
   * @example
   *   var parser = new Parser()
   *   parser.tokenizeInline('_foo_')
   *
   * @param {string} value - Content.
   * @return {Array.<Object>} - Nodes.
   */

  parser.tokenizeInline = parser.tokenizeFactory('inline')

  parser.descape = descapeFactory(parser, 'escape')
  parser.decode = decodeFactory(parser)

  return parser.parse
}

export default parserFactory
