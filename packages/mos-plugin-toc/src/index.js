const m = require('markdownscript')
const GithubSlugger = require('github-slugger')

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
function toExpression (value) {
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
function isOpeningHeading (node, depth, expression) {
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
function isClosingHeading (node, depth) {
  return node && (depth && node.type === HEADING && node.depth <= depth ||
    node.type === 'markdownScript')
}

/**
 * Create a list.
 *
 * @return {Object} - List node.
 */
function list () {
  return m.list({ ordered: false }, [])
}

/**
 * Create a list item.
 *
 * @return {Object} - List-item node.
 */
function listItem () {
  return m.listItem({ loose: false }, [])
}

/**
 * Insert a `node` into a `parent`.
 *
 * @param {Object} node - `node` to insert.
 * @param {Object} parent - Parent of `node`.
 */
function insert (node, parent) {
  var children = parent.children
  var length = children.length
  var last = children[length - 1]
  var index
  var item

  if (node.depth === 1) {
    item = listItem()

    item.children.push(
      m.paragraph([
        m.link({ title: null, url: `#${node.id}` }, [node.value]),
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
    parent.loose = false
    return
  }
  index = -1

  while (++index < length) {
    children[index].loose = false // isLoose
  }
}

/**
 * Transform a list of heading objects to a markdown list.
 *
 * @param {Array.<Object>} map - Heading-map to insert.
 * @return {Object} - List node.
 */
function contents (map) {
  var minDepth = Infinity
  var index = -1
  var length = map.length

  /*
   * Find minimum depth.
   */

  while (++index < length) {
    if (map[index].depth < minDepth) {
      minDepth = map[index].depth
    }
  }

  /*
   * Normalize depth.
   */

  index = -1

  while (++index < length) {
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

  while (++index < length) {
    insert(map[index], table)
  }

  return table
}

function valueOf (node) {
  return node && node.value || ''
}

function toString (node) {
  return (valueOf(node) ||
    (node.children && node.children.filter(child => child.type !== 'html').map(toString).join('')) ||
    '').trim()
}

export default function plugin (mos, md) {
  var settings = md.options || {}
  var heading = toExpression(settings.heading || DEFAULT_HEADING)
  var depth = settings.maxDepth || 6

  mos.compile.pre((next, node, opts) => {
    var result = search(node, heading, depth)

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
  function search (root, expression, maxDepth) {
    let index = -1
    let depth = null
    let map = []
    let headingIndex
    let closingIndex

    while (++index < root.children.length) {
      const child = root.children[index]

      if ([HEADING, 'markdownScript'].indexOf(child.type) === -1) {
        continue
      }

      if (headingIndex && isClosingHeading(child, depth)) {
        closingIndex = index
        searchChildren(root.children.slice(index))
        break
      }

      if (isOpeningHeading(child, depth, expression)) {
        headingIndex = index + 1
        depth = child.depth
      }
    }

    function searchChildren (children) {
      if (!children || !children.length) return

      const child = children.shift()

      if ([HEADING, 'markdownScript'].indexOf(child.type) === -1) {
        return searchChildren(children)
      }

      if (child.type === 'markdownScript') {
        return searchChildren(child.children.concat(children))
      }

      const value = toString(child)

      if (value && child.depth <= maxDepth) {
        map.push({
          depth: child.depth,
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

  function getId (child) {
    if (child.children && child.children[0].type === 'html') {
      const match = child.children[0].value.match(/name="([a-zA-Z0-9\-_]+)"/)
      if (match) return match[1]
    }
    return slugs.slug(toString(child))
  }
}

plugin.attributes = {
  pkg: require('../package.json'),
}
