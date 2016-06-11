import repeat from 'repeat-string'
import pad from './pad'

const BREAK = '\n\n'
const LIST_ITEM_ONE = '1'
const LIST_ITEM_MIXED = 'mixed'
const INDENT = 4

/*
 * Which method to use based on `list.ordered`.
 */

const ORDERED_MAP = {}

ORDERED_MAP.true = visitOrderedItems
ORDERED_MAP.false = visitUnorderedItems

export default (compiler, node) => ORDERED_MAP[node.ordered](compiler, node)

/**
 * Visit ordered list items.
 *
 * Starts the list with
 * `node.start` and increments each following list item
 * bullet by one:
 *
 *     2. foo
 *     3. bar
 *
 * In `incrementListMarker: false` mode, does not increment
 * each marker and stays on `node.start`:
 *
 *     1. foo
 *     1. bar
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitOrderedItems({
 *     type: 'list',
 *     ordered: true,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '1.  bar'
 *
 * @param {Object} node - `list` node with
 *   `ordered: true`.
 * @return {string} - Markdown list.
 */
function visitOrderedItems (compiler, node) {
  const values = []
  let index = -1

  while (++index < node.children.length) {
    const bullet = `${compiler.options.incrementListMarker ? node.start + index : node.start}.`
    values[index] = listItem(compiler, node.children[index], node, index, bullet)
  }

  return values.join('\n')
}

/**
 * Visit unordered list items.
 *
 * Uses `options.bullet` as each item's bullet.
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} node - `list` node with
 *   `ordered: false`.
 * @return {string} - Markdown list.
 */
function visitUnorderedItems (compiler, node) {
  const values = []
  let index = -1

  while (++index < node.children.length) {
    values[index] = listItem(compiler, node.children[index], node, index, compiler.options.bullet)
  }

  return values.join('\n')
}

/*
 * Which checkbox to use.
 */

const CHECKBOX_MAP = {}

CHECKBOX_MAP.null = ''
CHECKBOX_MAP.undefined = ''
CHECKBOX_MAP.true = '[x] '
CHECKBOX_MAP.false = '[ ] '

/**
 * Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.listItem({
 *     type: 'listItem',
 *     checked: true,
 *     children: [{
 *       type: 'text',
 *       value: 'bar'
 *     }]
 *   }, {
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       checked: true,
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   }, 0, '*');
 *   '-   [x] bar'
 *
 * @param {Object} node - `listItem` node.
 * @param {Object} parent - `list` node.
 * @param {number} position - Index of `node` in `parent`.
 * @param {string} bullet - Bullet to use.  This, and the
 *   `listItemIndent` setting define the used indent.
 * @return {string} - Markdown list item.
 */
function listItem (compiler, node, parent, position, bullet) {
  const values = []
  let index = -1

  while (++index < node.children.length) {
    values[index] = compiler.visit(node.children[index], node)
  }

  let value = CHECKBOX_MAP[node.checked] + values.join(node.loose ? BREAK : '\n')

  let spacing
  let indent
  if (
    compiler.options.listItemIndent === LIST_ITEM_ONE ||
    (compiler.options.listItemIndent === LIST_ITEM_MIXED && value.indexOf('\n') === -1)
  ) {
    indent = bullet.length + 1
    spacing = ' '
  } else {
    indent = Math.ceil((bullet.length + 1) / INDENT) * INDENT
    spacing = repeat(' ', indent - bullet.length)
  }

  value = bullet + spacing + pad(value, indent / INDENT).slice(indent)

  if (node.loose && parent.children.length - 1 !== position) {
    value += '\n'
  }

  return value
}
