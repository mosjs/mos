import {Node, Location} from '../node'
import decode from 'parse-entities'
import filePosition from 'file-position'
import removePosition from 'unist-util-remove-position'
import {raise, clean, validate} from '../utilities'
import {parse as defaultOptions} from '../defaults'
import tokenizeFactory from './tokenize-factory'
import {Eater} from './tokenize-factory'
import {Decoder, SimpleParser, Parser, Processor, ParserOptions} from './parser'
import runAsync from 'babel-run-async'

/**
 * Factory to create an entity decoder.
 *
 * @param {Object} context - Context to attach to, e.g.,
 *   a parser.
 * @return {Function} - See `decode`.
 */
function decodeFactory (context: SimpleParser): Decoder {
  /**
   * Get found offsets starting at `start`.
   *
   * @param {number} start - Starting line.
   * @return {Array.<number>} - Offsets starting at `start`.
   */
  function getIndent (start: number): number[] {
    const offset = context.offset
    const result: number[] = []

    while (++start) {
      if (!(start in offset)) {
        break
      }

      result.push((offset[start] || 0) + 1)
    }

    return result
  }

  /**
   * Normalize `position` to add an `indent`.
   *
   * @param {Position} position - Reference
   * @return {Position} - Augmented with `indent`.
   */
  function normalize (position: Location) {
    return {
      start: position,
      indent: getIndent(position.line),
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
  function handleWarning (reason: string, position: Location, code: number): void {
    if (code === 3) {
      return
    }

    // TODO: uncomment context.file.warn(reason, position)
  }

  /**
   * Decode `value` (at `position`) into text-nodes.
   *
   * @param {string} value - Value to parse.
   * @param {Position} position - Position to start parsing at.
   * @param {Function} handler - Node handler.
   */
  const decoder: Decoder = Object.assign(function (value: string, position: Location, handler: Function): void {
    decode(value, {
      position: normalize(position),
      warning: handleWarning,
      text: handler,
      reference: handler,
      textContext: context,
      referenceContext: context,
    })
  }, {
    /**
     * Decode `value` (at `position`) into a string.
     *
     * @param {string} value - Value to parse.
     * @param {Position} position - Position to start
     *   parsing at.
     * @return {string} - Plain-text.
     */
    raw: function (value: string, position: Location): string {
      return decode(value, {
        position: normalize(position),
        warning: handleWarning,
      })
    }
  })

  return decoder
}

type EscapeScope = {
  [key: string]: string[],
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
function descapeFactory (parser: SimpleParser): Function {
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
  function descape (value: string): string {
    let prev = 0
    let index = value.indexOf('\\')
    const queue: string[] = []

    while (index !== -1) {
      queue.push(value.slice(prev, index))
      prev = index + 1
      const character = value.charAt(prev)

      /*
       * If the following character is not a valid escape,
       * add the slash.
       */

      if (!character || parser.escape.indexOf(character) === -1) {
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
function parserFactory (processor: Processor) {

  /*
   * Enter and exit helpers.
   */

  const parser: SimpleParser = {
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
    setOptions (options?: ParserOptions) {
      const escape = processor.data.escape
      const current = parser.options
      let key: string

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
    indent (start: number): (offset: number) => void {
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
      function indenter (offset: number) {
        parser.offset[line] = (parser.offset[line] || 0) + offset

        line++
      }

      return indenter
    },

    /*
     * Expose tokenizers for block-level nodes.
     */

    blockTokenizers: processor.blockTokenizers,

    /*
     * Expose tokenizers for inline-level nodes.
     */

    inlineTokenizers: processor.inlineTokenizers,

    /*
     * Expose `defaults`.
     */
    options: Object.assign({}, defaultOptions),

    context: {
      inLink: false,
      inList: true,
      atStart: true,
      inBlock: false,
      inAutoLink: false,
    },
  }

  const normalParser: Parser = Object.assign(parser, {
    descape: descapeFactory(parser),
    decode: decodeFactory(parser),
    /**
     * Parse the bound file.
     *
     * @example
     *   new Parser(new File('_Foo_.')).parse()
     *
     * @this {Parser}
     * @return {Object} - `root` node.
     */
    parse (contents: string, opts?: ParserOptions): Promise<Node> {
      parser.setOptions(opts)

      const value = clean(contents)
      const getIndex = filePosition(contents)
      parser.toOffset = (pos: {line: number, column: number}): number => getIndex(pos.line - 1, pos.column - 1)

      /*
       * Add an `offset` matrix, used to keep track of
       * syntax and white space indentation per line.
       */

      parser.offset = {}

      return normalParser.tokenizeBlock(value)
        .then(children => {
          const start: Location = {
            line: 1,
            column: 1,
            offset: 0,
          }
          const node: Node = {
            type: 'root',
            children,
            position: {
              start,
              end: parser.eof || Object.assign({}, start),
            },
          }

          if (!parser.options.position) {
            removePosition(node)
          }

          return node
        })
    },
  })
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
  normalParser.tokenizeBlock = tokenizeFactory(normalParser, 'block')

  normalParser.tryTokenizeBlock = (eat: Eater, tokenizerName: string, subvalue: string, silent: boolean): Promise<boolean> =>
   runAsync(normalParser.blockTokenizers.find(t => t.name === tokenizerName).func)(Object.assign({}, normalParser, {eat}), subvalue, silent)

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

  normalParser.tokenizeInline = tokenizeFactory(normalParser, 'inline')

  return normalParser.parse
}

export default parserFactory
