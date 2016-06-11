import repeat from 'repeat-string'
const YAML_FENCE_LENGTH = 3

export default (compiler, node) => {
  const delimiter = repeat('-', YAML_FENCE_LENGTH)
  const value = node.value ? `\n${node.value}` : ''

  return `${delimiter + value}\n${delimiter}`
}
