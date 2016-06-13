import {ImageNode} from '../../node'
import {SpecificVisitor} from '../visitor'
import label from './label'

const visitor: SpecificVisitor<ImageNode> = (compiler, node) => {
  const alt = compiler.encode(node.alt, node) || ''

  return `![${alt}]${label(node)}`
}

export default visitor
