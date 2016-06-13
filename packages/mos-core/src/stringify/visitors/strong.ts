import {Visitor} from '../visitor'

const visitor: Visitor = (compiler, node) => {
  const marker = compiler.options.strong + compiler.options.strong

  return marker + compiler.all(node).join('') + marker
}

export default visitor
