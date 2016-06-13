import {SpecificVisitor} from '../visitor'
import {CodeNode} from '../../node'
import pad from './pad'
import longestStreak from 'longest-streak'
const MINIMUM_CODE_FENCE_LENGTH = 3
const ERROR_LIST_ITEM_INDENT = 'Cannot indent code properly. See ' +
    'http://git.io/vgFvT'
const LIST_ITEM_TAB = 'tab'
/*
 * Naive fence expression.
 */

const FENCE = /([`~])\1{2}/

const visitor: SpecificVisitor<CodeNode> = (compiler, node, parent) => {
  let value = node.value
  const options = compiler.options
  const marker = options.fence
  const language = compiler.encode(node.lang || '', node)

  /*
   * Without (needed) fences.
   */

  if (!language && !options.fences && value) {
    /*
     * Throw when pedantic, in a list item which
     * isn’t compiled using a tab.
     */

    if (
      parent &&
      parent.type === 'listItem' &&
      options.listItemIndent !== LIST_ITEM_TAB &&
      options.pedantic
    ) {
      throw new Error(ERROR_LIST_ITEM_INDENT + node.position)
    }

    return pad(value, 1)
  }

  let fence = longestStreak(value, marker) + 1

  /*
   * Fix GFM / RedCarpet bug, where fence-like characters
   * inside fenced code can exit a code-block.
   * Yes, even when the outer fence uses different
   * characters, or is longer.
   * Thus, we can only pad the code to make it work.
   */

  if (FENCE.test(value)) {
    value = pad(value, 1)
  }

  const fenceMarkdown = marker.repeat(Math.max(fence, MINIMUM_CODE_FENCE_LENGTH))

  return `${fenceMarkdown + language}\n${value}\n${fenceMarkdown}`
}

export default visitor
