import {Node, Position, Location} from '../node'
import {Parser} from './parser'
import * as MERGEABLE_NODES from '../mergeable-nodes';
import {mergeable} from '../utilities'
import runAsync from 'babel-run-async'
import Tokenizer from './tokenizer';

export interface Resetter {
  <T extends Node>(node: T, parent?: Node): Promise<Node>
  test: () => Position
}

export type ApplyFunc = {
  <T extends Node>(node: Promise<T>, parent?: Node): Promise<Node>,
  <T extends Node>(node: T, parent?: Node): Promise<Node>,
}

export type Applier = ApplyFunc & {
  reset: Resetter
  test: () => Position
}

export interface Eater {
  (value: string): Applier
  now: () => Location
}

export type ParserAndEater = Parser & {
  eat: Eater
}

/*
 * Error messages.
 */

const ERR_INFINITE_LOOP = 'Infinite loop'
const ERR_INCORRECTLY_EATEN = 'Incorrectly eaten value: please report this ' +
    'warning on http://git.io/vg5Ft'

export type Tokenize = (value: string, location?: Location) => Promise<Node[]>

/**
 * Construct a tokenizer.  This creates both
 * `tokenizeInline` and `tokenizeBlock`.
 *
 * @example
 *   Parser.prototype.tokenizeInline = tokenizeFactory('inline')
 *
 * @param {string} type - Name of parser, used to find
 *   its expressions (`%sMethods`) and tokenizers
 *   (`%Tokenizers`).
 * @return {Function} - Tokenizer.
 */
export default function tokenizeFactory (parser: Parser, type: string): Tokenize {
  return tokenize

  /**
   * Tokenizer for a bound `type`
   *
   * @example
   *   parser = new Parser()
   *   parser.tokenizeInline('_foo_')
   *
   * @param {string} value - Content.
   * @param {Object?} [location] - Offset at which `value`
   *   starts.
   * @return {Array.<Object>} - Nodes.
   */
  function tokenize (value: string, location: Location): Promise<Node[]> {
    const offset = parser.offset
    const tokens: Node[] = []
    const tokenizers = parser[`${type}Tokenizers`]
    let line = location ? location.line : 1
    let column = location ? location.column : 1

    /*
     * Trim white space only lines.
     */

    if (!value) {
      return Promise.resolve(tokens)
    }

    /**
     * Update line, column, and offset based on
     * `value`.
     *
     * @example
     *   updatePosition('foo')
     *
     * @param {string} subvalue - Subvalue to eat.
     */
    function updatePosition (subvalue: string) {
      let lastIndex = -1
      let index = subvalue.indexOf('\n')

      while (index !== -1) {
        line++
        lastIndex = index
        index = subvalue.indexOf('\n', index + 1)
      }

      if (lastIndex === -1) {
        column += subvalue.length
      } else {
        column = subvalue.length - lastIndex
      }

      if (line in offset) {
        if (lastIndex !== -1) {
          column += offset[line]
        } else if (column <= offset[line]) {
          column = offset[line] + 1
        }
      }
    }

    /**
     * Get offset. Called before the first character is
     * eaten to retrieve the range's offsets.
     *
     * @return {Function} - `done`, to be called when
     *   the last character is eaten.
     */
    function getOffset () {
      const indentation: number[] = []
      let pos = line + 1

      /**
       * Done. Called when the last character is
       * eaten to retrieve the range’s offsets.
       *
       * @return {Array.<number>} - Offset.
       */
      function done (): number[] {
        const last = line + 1

        while (pos < last) {
          indentation.push((offset[pos] || 0) + 1)

          pos++
        }

        return indentation
      }

      return done
    }

    /**
     * Get the current position.
     *
     * @example
     *   position = now() // {line: 1, column: 1, offset: 0}
     *
     * @return {Object} - Current Position.
     */
    function now (): Location {
      const pos = { line, column }

      return Object.assign({}, pos, {
        offset: parser.toOffset(pos),
      })
    }

    /**
     * Throw when a value is incorrectly eaten.
     * This shouldn’t happen but will throw on new,
     * incorrect rules.
     *
     * @example
     *   // When the current value is set to `foo bar`.
     *   validateEat('foo')
     *   eat('foo')
     *
     *   validateEat('bar')
     *   // throws, because the space is not eaten.
     *
     * @param {string} subvalue - Value to be eaten.
     * @throws {Error} - When `subvalue` cannot be eaten.
     */
    function validateEat (subvalue: string) {
      /* istanbul ignore if */
      if (value.substring(0, subvalue.length) !== subvalue) {
        throw new Error(ERR_INCORRECTLY_EATEN + now())
      }
    }

    /**
     * Mark position and patch `node.position`.
     *
     * @example
     *   var update = position()
     *   updatePosition('foo')
     *   update({})
     *   // {
     *   //   position: {
     *   //     start: {line: 1, column: 1, offset: 0},
     *   //     end: {line: 1, column: 3, offset: 2}
     *   //   }
     *   // }
     *
     * @returns {Function} - Updater.
     */
    function position () {
      const before = now()

      /**
       * Add the position to a node.
       *
       * @example
       *   update({type: 'text', value: 'foo'})
       *
       * @param {Node} node - Node to attach position
       *   on.
       * @param {Array} [indent] - Indentation for
       *   `node`.
       * @return {Node} - `node`.
       */
      function update (prev?: Position, indent?: number[]): Position {
        const start = prev ? prev.start : before
        let combined: number[] = []
        let n = prev && prev.end.line
        const l = before.line

        /*
         * If there was already a `position`, this
         * node was merged.  Fixing `start` wasn’t
         * hard, but the indent is different.
         * Especially because some information, the
         * indent between `n` and `l` wasn’t
         * tracked.  Luckily, that space is
         * (should be?) empty, so we can safely
         * check for it now.
         */

        if (prev && indent && prev.indent) {
          combined = prev.indent

          if (n < l) {
            while (++n < l) {
              combined.push((offset[n] || 0) + 1)
            }

            combined.push(before.column)
          }

          indent = combined.concat(indent)
        }

        return {
          start,
          end: now(),
          indent: indent || [],
        }
      }

      return update
    }

    /**
     * Add `node` to `parent`s children or to `tokens`.
     * Performs merges where possible.
     *
     * @example
     *   add({})
     *
     *   add({}, {children: []})
     *
     * @param {Object} node - Node to add.
     * @param {Object} [parent] - Parent to insert into.
     * @return {Object} - Added or merged into node.
     */
    function add (node: Node, parent: Node): Node {
      const children: Node[] = !parent ? tokens : parent.children

      const prev = children[children.length - 1]

      if (
        prev &&
        node.type === prev.type &&
        node.type in MERGEABLE_NODES &&
        mergeable(prev) &&
        mergeable(node)
      ) {
        node = MERGEABLE_NODES[node.type].call(
          parser, prev, node
        )
      }

      if (node !== prev) {
        children.push(node)
      }

      if (parser.context.atStart && tokens.length) {
        parser.context.atStart = false
      }

      return node
    }

    /**
     * Remove `subvalue` from `value`.
     * Expects `subvalue` to be at the start from
     * `value`, and applies no validation.
     *
     * @example
     *   eat('foo')({type: 'text', value: 'foo'})
     *
     * @param {string} subvalue - Removed from `value`,
     *   and passed to `updatePosition`.
     * @return {Function} - Wrapper around `add`, which
     *   also adds `position` to node.
     */
    const eat: Eater = Object.assign(function (subvalue: string) {
        let getIndent = getOffset()
        let indent: number[]
        const pos = position()
        const current = now()

        validateEat(subvalue)

        const applyFn: ApplyFunc = function (node: Node | Promise<Node>, parent?: Node): Promise<Node> {
          return (node instanceof Promise)
            ? node.then(updatePos)
            : Promise.resolve(updatePos(node))

          function updatePos (node: Node): Node {
            node.position = pos(node.position)
            node = add(node, parent)
            node.position = pos(node.position, indent)
            return node
          }
        }

        /**
         * Functions just like apply, but resets the
         * content:  the line and column are reversed,
         * and the eaten value is re-added.
         *
         * This is useful for nodes with a single
         * type of content, such as lists and tables.
         *
         * See `apply` above for what parameters are
         * expected.
         *
         * @return {Node} - Added node.
         */
        const reset: Resetter = Object.assign(
          function (node: Node, parent?: Node): Promise<Node> {
            return applyFn(node, parent)
              .then(node => {
                line = current.line
                column = current.column
                value = subvalue + value

                return node
              })
          }, {
            test,
          })

        /**
         * Add the given arguments, add `position` to
         * the returned node, and return the node.
         *
         * @param {Object} node - Node to add.
         * @param {Object} [parent] - Node to insert into.
         * @return {Node} - Added node.
         */
        const apply: Applier = Object.assign(
          applyFn, {
            reset,
            test,
          })

        /**
         * Test the position, after eating, and reverse
         * to a not-eaten state.
         *
         * @return {Position} - Position after eating `subvalue`.
         */
        function test (): Position {
          const position = pos()

          line = current.line
          column = current.column
          value = subvalue + value

          return position
        }

        value = value.substring(subvalue.length)

        updatePosition(subvalue)

        indent = getIndent()

        return apply
      },
      {
        now,
      }
    )

    /*
     * Sync initial offset.
     */

    updatePosition('')

    /*
     * Iterate over `value`, and iterate over all
     * tokenizers.  When one eats something, re-iterate
     * with the remaining value.  If no tokenizer eats,
     * something failed (should not happen) and an
     * exception is thrown.
     */

    function process (): Promise<Node[]> {
      if (value) {
        return matchMethods(tokenizers.slice())
          .then(() => process())
      }

      parser.eof = now()

      return Promise.resolve(tokens)

      function matchMethods (tokenizers: { func: Tokenizer, name: string }[]): Promise<void> {
        const tokenizer = tokenizers.shift()
        if (!tokenizer) {
          throw new Error(ERR_INFINITE_LOOP + eat.now())
        }

        if (
          tokenizer && tokenizer.func &&
          (!tokenizer.func.onlyAtStart || parser.context.atStart) &&
          (!tokenizer.func.onlyAtTop || parser.context.atTop) &&
          (!tokenizer.func.notInBlockquote || !parser.context.inBlockquote) &&
          (!tokenizer.func.notInLink || !parser.context.inLink) &&
          (!tokenizer.func.notInAutoLink || !parser.context.inAutoLink)
        ) {
          const valueLength = value.length

          return runAsync(tokenizer.func)(Object.assign({}, parser, {eat}), value)
            .then(() => {
              const matched = valueLength !== value.length

              if (!matched) {
                return matchMethods(tokenizers)
              }

              return Promise.resolve()
            })
        }

        return matchMethods(tokenizers)
      }
    }

    return process()
  }
}
