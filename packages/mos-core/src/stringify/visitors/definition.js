import encloseURI from './enclose-uri'
import encloseTitle from './enclose-title'

export default (compiler, node) => {
  const value = `[${node.identifier}]`
  let url = encloseURI(node.url)

  if (node.title) {
    url += ` ${encloseTitle(node.title)}`
  }

  return `${value}: ${url}`
}
