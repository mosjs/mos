import {Visitor} from '../visitor'

const visitor: Visitor = (compiler, node) => {
  const marker = compiler.options.emphasis

  return marker + compiler.all(node).join('') + marker
}

export default visitor
