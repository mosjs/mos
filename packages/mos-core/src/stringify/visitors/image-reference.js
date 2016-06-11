import label from './label'

export default (compiler, node) => {
  const alt = compiler.encode(node.alt, node) || ''

  return `![${alt}]${label(node)}`
}
