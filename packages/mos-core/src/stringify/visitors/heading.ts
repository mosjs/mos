import {SpecificVisitor} from '../visitor'
import {HeadingNode} from '../../node'

const visitor: SpecificVisitor<HeadingNode> = (compiler, node) => {
  const setext = compiler.options.setext
  const closeAtx = compiler.options.closeAtx
  let content = compiler.all(node).join('')

  if (setext && node.depth < 3) {
    return `${content}\n${(node.depth === 1 ? '=' : '-').repeat(content.length)}`
  }

  const prefix = '#'.repeat(node.depth)
  content = `${prefix} ${content}`

  if (closeAtx) {
    content += ` ${prefix}`
  }

  return content
}

export default visitor
