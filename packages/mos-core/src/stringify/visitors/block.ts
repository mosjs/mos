import {Visitor} from '../visitor'
import {CodeNode, ListNode, Node} from '../../node'
const BREAK = '\n\n'
const GAP = `${BREAK}\n`

const visitor: Visitor = (compiler, node) => {
  const values: string[] = []
  const children = node.children
  let index = -1
  let prev: Node

  while (++index < children.length) {
    const child = children[index]

    if (prev) {
      /*
       * Duplicate nodes, such as a list
       * directly following another list,
       * often need multiple new lines.
       *
       * Additionally, code blocks following a list
       * might easily be mistaken for a paragraph
       * in the list itself.
       */

      if (child.type === prev.type && prev.type === 'list') {
        values.push((prev as ListNode).ordered === (child as ListNode).ordered ? GAP : BREAK)
      } else if (
        prev.type === 'list' &&
        child.type === 'code' &&
        !(child as CodeNode).lang
      ) {
        values.push(GAP)
      } else {
        values.push(BREAK)
      }
    }

    values.push(compiler.visit(child, node))

    prev = child
  }

  return values.join('')
}

export default visitor
