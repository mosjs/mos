import {SpecificVisitor} from '../visitor'
import {ImageNode} from '../../node'
import encloseURI from './enclose-uri'
import encloseTitle from './enclose-title'

const visitor: SpecificVisitor<ImageNode> = (compiler, node) => {
  let url = encloseURI(compiler.encode(node.url, node))

  if (node.title) {
    url += ` ${encloseTitle(compiler.encode(node.title, node))}`
  }

  const value = `![${compiler.encode(node.alt || '', node)}](${url})`

  return value
}

export default visitor
