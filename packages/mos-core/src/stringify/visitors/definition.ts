import {DefinitionNode} from '../../node'
import {SpecificVisitor} from '../visitor'
import encloseURI from './enclose-uri'
import encloseTitle from './enclose-title'

const visitor: SpecificVisitor<DefinitionNode> = (compiler, node) => {
  const value = `[${node.identifier}]`
  let url = encloseURI(node.url)

  if (node.title) {
    url += ` ${encloseTitle(node.title)}`
  }

  return `${value}: ${url}`
}

export default visitor
