import * as MERGEABLE_NODES from '../mergeable-nodes'
import {raise, validate, mergeable} from '../utilities'
import {stringify as defaultOptions} from '../defaults'
import encodeFactory from './encode-factory'
import escapeFactory from './escape-factory'
import LIST_BULLETS from './list-bullets'
import {Node} from '../node'
import {VisitorsMap} from './visitor'

import {Compiler, CompilerOptions} from './compiler'

/*
 * Constants.
 */

const MINIMUM_RULE_LENGTH = 3

/*
 * Character combinations.
 */

/*
 * Allowed entity options.
 */

const ENTITY_OPTIONS = {
  true: true,
  false: true,
  numbers: true,
  escape: true,
}

/*
 * Allowed horizontal-rule bullet characters.
 */

const THEMATIC_BREAK_BULLETS = {
  '*': true,
  '-': true,
  '_': true,
}

/*
 * Allowed emphasis characters.
 */

const EMPHASIS_MARKERS = {
  '_': true,
  '*': true,
}

/*
 * Allowed fence markers.
 */

const FENCE_MARKERS = {
  '`': true,
  '~': true,
}

/*
 * Allowed list-item-indent's.
 */

const LIST_ITEM_TAB = 'tab'
const LIST_ITEM_ONE = '1'
const LIST_ITEM_MIXED = 'mixed'

const LIST_ITEM_INDENTS = {
  [LIST_ITEM_ONE]: true,
  [LIST_ITEM_TAB]: true,
  [LIST_ITEM_MIXED]: true,
}

/*
 * Map of applicable enum's.
 */

const maps = {
  entities: ENTITY_OPTIONS,
  bullet: LIST_BULLETS,
  rule: THEMATIC_BREAK_BULLETS,
  listItemIndent: LIST_ITEM_INDENTS,
  emphasis: EMPHASIS_MARKERS,
  strong: EMPHASIS_MARKERS,
  fence: FENCE_MARKERS,
}

/**
 * Construct a new compiler.
 *
 * @example
 *   var compiler = new Compiler(new File('> foo.'));
 *
 * @constructor
 * @class {Compiler}
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 */
function compilerFactory (visitors: VisitorsMap) {
  const compiler: Compiler = {
    options: Object.assign({}, defaultOptions),

    /**
     * Set options.  Does not overwrite previously set
     * options.
     *
     * @example
     *   var compiler = new Compiler();
     *   compiler.setOptions({bullet: '*'});
     *
     * @this {Compiler}
     * @throws {Error} - When an option is invalid.
     * @param {Object?} [options] - Stringify settings.
     * @return {Compiler} - `self`.
     */
    setOptions (options: CompilerOptions): Compiler {
      const current = compiler.options

      if (options === null || options === undefined) {
        options = {}
      } else if (typeof options === 'object') {
        options = Object.assign({}, options)
      } else {
        raise(options, 'options')
      }

      for (const key in defaultOptions) {
        validate[typeof current[key]](
          options, key, current[key], maps[key]
        )
      }

      const ruleRepetition = options.ruleRepetition

      if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
        raise(ruleRepetition, 'options.ruleRepetition')
      }

      const encode = encodeFactory(String(options.entities))
      compiler.encode = (value: string, node: Node): string => {
        if (compiler.context.inShortcutReference || compiler.context.inCollapsedReference) {
          return value
        }
        return encode(value, node)
      }

      const escape = escapeFactory(compiler.context, options)
      compiler.escape = (value: string, node: Node, parent?: Node): string => {
        if (compiler.context.inShortcutReference || compiler.context.inCollapsedReference) {
          return value
        }
        return escape(value, node, parent)
      }

      compiler.options = options

      return compiler
    },

    context: {
      inLink: false,
      inTable: false,
      inShortcutReference: false,
      inCollapsedReference: false,
    },

    /**
     * Visit a node.
     *
     * @example
     *   var compiler = new Compiler();
     *
     *   compiler.visit({
     *     type: 'strong',
     *     children: [{
     *       type: 'text',
     *       value: 'Foo'
     *     }]
     *   });
     *   // '**Foo**'
     *
     * @param {Object} node - Node.
     * @param {Object?} [parent] - `node`s parent.
     * @return {string} - Compiled `node`.
     */
    visit (node, parent) {
      /*
       * Fail on unknown nodes.
       */

      if (typeof visitors[node.type] !== 'function') {
        throw new Error(`Missing compiler for node of type \`${node.type}\`: \`${node}\`` + node)
      }

      return visitors[node.type](compiler, node, parent)
    },

    /**
     * Visit all children of `parent`.
     *
     * @example
     *   var compiler = new Compiler();
     *
     *   compiler.all({
     *     type: 'strong',
     *     children: [{
     *       type: 'text',
     *       value: 'Foo'
     *     },
     *     {
     *       type: 'text',
     *       value: 'Bar'
     *     }]
     *   });
     *   // ['Foo', 'Bar']
     *
     * @param {Object} parent - Parent node of children.
     * @return {Array.<string>} - List of compiled children.
     */
    all (parent) {
      const children = parent.children
      const values: string[] = []
      let index = 0
      const length = children.length
      let mergedLength = 1
      let node = children[0]
      let next: Node

      if (length === 0) {
        return values
      }

      while (++index < length) {
        next = children[index]

        if (
            node.type === next.type &&
            node.type in MERGEABLE_NODES &&
            mergeable(node) &&
            mergeable(next)
        ) {
          node = MERGEABLE_NODES[node.type].call(compiler, node, next)
        } else {
          values.push(compiler.visit(node, parent))
          node = next
          children[mergedLength++] = node
        }
      }

      values.push(compiler.visit(node, parent))
      children.length = mergedLength

      return values
    },

    /**
     * Stringify the bound file.
     *
     * @example
     *   var file = new VFile('__Foo__');
     *
     *   file.namespace('mdast').tree = {
     *     type: 'strong',
     *     children: [{
     *       type: 'text',
     *       value: 'Foo'
     *     }]
     *   });
     *
     *   new Compiler(file).compile();
     *   // '**Foo**'
     *
     * @this {Compiler}
     * @return {string} - Markdown document.
     */
    compile (tree, opts) {
      compiler.setOptions(opts)
      return compiler.visit(tree)
    },
  }

  return compiler.compile
}

export default compilerFactory
