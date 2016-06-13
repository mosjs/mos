import {Visitor} from '../visitor'
const YAML_FENCE_LENGTH = 3

const visitor: Visitor = (compiler, node) => {
  const delimiter = '-'.repeat(YAML_FENCE_LENGTH)
  const value = node.value ? `\n${node.value}` : ''

  return `${delimiter + value}\n${delimiter}`
}

export default visitor
