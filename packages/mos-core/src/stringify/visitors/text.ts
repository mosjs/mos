import {Visitor} from '../visitor'

const visitor: Visitor = (compiler, node, parent) => compiler.encode(compiler.escape(node.value, node, parent), node)

export default visitor
