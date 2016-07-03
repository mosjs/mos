import m from 'markdownscript'
import GithubSlugger from 'github-slugger'
import {HeadingNode, ListItemNode, ListNode, Node} from 'mos-core'
import {Plugin, Processor, PluginOptions} from 'mos-processor'
import readPkgUp from 'mos-read-pkg-up';

const HEADING = 'heading'
const LIST = 'list'
const LIST_ITEM = 'listItem'
const DEFAULT_HEADING = 'toc|table[ -]of[ -]contents?'

/**
 * Transform a string into an applicable expression.
 *
 * @param {string} value - Content to expressionise.
 * @return {RegExp} - Expression from `value`.
 */
function toExpression (value: string): RegExp {
  return new RegExp('^(' + value + ')$', 'i')
}

/**
 * Check if `node` is the main heading.
 *
 * @param {Node} node - Node to check.
 * @param {number} depth - Depth to check.
 * @param {RegExp} expression - Expression to check.
 * @return {boolean} - Whether `node` is a main heading.
 */
function isOpeningHeading (node: HeadingNode, depth: number, expression: RegExp): boolean {
  return depth === null && node && node.type === HEADING &&
    expression.test(toString(node))
}

/**
 * Check if `node` is the next heading.
 *
 * @param {Node} node - Node to check.
 * @param {number} depth - Depth of opening heading.
 * @return {boolean} - Whether znode is a closing heading.
 */
function isClosingHeading (node: HeadingNode, depth: number): boolean {
  return node && (depth && node.type === HEADING && node.depth <= depth ||
    node.type === 'markdownScript')
}

/**
 * Create a list.
 *
 * @return {Object} - List node.
 */
function list (): ListNode {
  return m.list({ ordered: false }, [])
}

/**
 * Create a list item.
 *
 * @return {Object} - List-item node.
 */
function listItem (): ListItemNode {
  return m.listItem({ loose: false }, [])
}

/**
 * Insert a `node` into a `parent`.
 *
 * @param {Object} node - `node` to insert.
 * @param {Object} parent - Parent of `node`.
 */
function insert (node: HeadingNode | HeadingWithId, parent: Node) {
  const children = parent.children
  const length = children.length
  const last = children[length - 1]
  let index: number
  let item: Node

  if (node.depth === 1) {
    item = listItem()

    item.children.push(
      m.paragraph([
        m.link({ title: null, url: `#${node['id']}` }, [node.value]),
      ])
    )

    children.push(item)
  } else if (last && last.type === LIST_ITEM) {
    insert(node, last)
  } else if (last && last.type === LIST) {
    node.depth--

    insert(node, last)
  } else if (parent.type === LIST) {
    item = listItem()

    insert(node, item)

    children.push(item)
  } else {
    item = list()
    node.depth--

    insert(node, item)

    children.push(item)
  }

  /*
   * Properly style list-items with new lines.
   */

  if (parent.type === LIST_ITEM) {
    (<ListItemNode>parent).loose = false
    return
  }
  index = -1

  while (++index < length) {
    (<ListNode | ListItemNode>children[index]).loose = false // isLoose
  }
}

type HeadingWithId = {
  depth: number,
  id: string,
  value: string,
}

/**
 * Transform a list of heading objects to a markdown list.
 *
 * @param {Array.<Object>} map - Heading-map to insert.
 * @return {Object} - List node.
 */
function contents (map: HeadingWithId[]) {
  let minDepth = Infinity
  let index = -1

  /*
   * Find minimum depth.
   */

  while (++index < map.length) {
    if (map[index].depth < minDepth) {
      minDepth = map[index].depth
    }
  }

  /*
   * Normalize depth.
   */

  index = -1

  while (++index < map.length) {
    map[index].depth -= minDepth - 1
  }

  /*
   * Construct the main list.
   */

  const table = list()

  /*
   * Add TOC to list.
   */

  index = -1

  while (++index < map.length) {
    insert(map[index], table)
  }

  return table
}

function valueOf (node: Node): string {
  return node && node.value || ''
}

function toString (node: Node): string {
  return (valueOf(node) ||
    (node.children && node.children.filter(child => child.type !== 'html').map(toString).join('')) ||
    '').trim()
}

const plugin: Plugin = Object.assign(function plugin (mos: Processor, md: PluginOptions) {
  const settings = md.options || {}
  let heading = toExpression(settings.heading || DEFAULT_HEADING)
  const depth = settings.maxDepth || 6

  mos.compile.pre((next, node, opts) => {
    const result = search(node, heading, depth)

    if (result.index === null || !result.map.length) {
      return next.applySame()
    }

    /*
     * Add markdown.
     */

    node.children = [].concat(
      node.children.slice(0, result.index),
      contents(result.map),
      node.children.slice(result.index)
    )

    return next.applySame()
  })

  /**
   * Search a node for a location.
   *
   * @param {Node} root - Parent to search in.
   * @param {RegExp} expression - Heading-content to search
   *   for.
   * @param {number} maxDepth - Maximum-depth to include.
   * @return {Object} - Results.
   */
  function search (root: Node, expression: RegExp, maxDepth: number) {
    let index = -1
    let depth: number = null
    let map: HeadingWithId[] = []
    let headingIndex: number
    let closingIndex: number

    while (++index < root.children.length) {
      const child = root.children[index]

      if ([HEADING, 'markdownScript'].indexOf(child.type) === -1) {
        continue
      }

      if (headingIndex && isClosingHeading(<HeadingNode>child, depth)) {
        closingIndex = index
        searchChildren(root.children.slice(index))
        break
      }

      if (isOpeningHeading(<HeadingNode>child, depth, expression)) {
        headingIndex = index + 1
        depth = (<HeadingNode>child).depth
      }
    }

    function searchChildren (children: Node[]): void {
      if (!children || !children.length) {
        return
      }

      const child: Node = children.shift()

      if ([HEADING, 'markdownScript'].indexOf(child.type) === -1) {
        return searchChildren(children)
      }

      if (child.type === 'markdownScript') {
        return searchChildren(child.children.concat(children))
      }

      const value = toString(child)

      const depth = (<HeadingNode>child).depth
      if (value && depth <= maxDepth) {
        map.push({
          depth,
          value,
          id: getId(child),
        })
      }

      return searchChildren(children)
    }

    if (headingIndex) {
      if (!closingIndex) {
        closingIndex = root.children.length + 1
      }

      /*
       * Remove current TOC.
       */
      root.children.splice(headingIndex, closingIndex - headingIndex)
    }

    return {
      index: headingIndex || null,
      map,
    }
  }

  const slugs = new GithubSlugger()

  function getId (child: Node): string {
    if (child.children && child.children[0].type === 'html') {
      const match = child.children[0].value.match(/name="([a-zA-Z0-9\-_]+)"/)
      if (match) {
        return match[1]
      }
    }
    return slugs.slug(toString(child))
  }
}, {
  attributes: { pkg: readPkgUp.sync(__dirname).pkg }
})

export default plugin
