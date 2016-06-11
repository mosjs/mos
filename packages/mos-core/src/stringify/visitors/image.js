import encloseURI from './enclose-uri'
import encloseTitle from './enclose-title'

export default (compiler, node) => {
  let url = encloseURI(compiler.encode(node.url, node))

  if (node.title) {
    url += ` ${encloseTitle(compiler.encode(node.title, node))}`
  }

  const value = `![${compiler.encode(node.alt || '', node)}](${url})`

  return value
}
