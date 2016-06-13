import {Node} from './node'

/*
 * Define nodes of a type which can be merged.
 */

/**
 * Merge two text nodes: `node` into `prev`.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} node - Following sibling.
 * @return {Object} - `prev`.
 */
export const text = (prev: Node, node: Node): Node => {
  prev.value += node.value

  return prev
}

/**
 * Merge two blockquotes: `node` into `prev`, unless in
 * CommonMark mode.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} node - Following sibling.
 * @return {Object} - `prev`, or `node` in CommonMark mode.
 */
export const blockquote = function (prev: Node, node: Node): Node {
  if (this.options.commonmark) {
    return node
  }

  prev.children = prev.children.concat(node.children)

  return prev
}
