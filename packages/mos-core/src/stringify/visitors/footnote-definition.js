import repeat from 'repeat-string'
const BREAK = '\n\n'
const INDENT = 4

export default (compiler, node) => {
  const id = node.identifier.toLowerCase()

  return `[^${id}]: ${compiler.all(node).join(BREAK + repeat(' ', INDENT))}`
}
