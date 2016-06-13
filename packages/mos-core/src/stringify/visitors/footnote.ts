import {Visitor} from '../visitor'

const visitor: Visitor = (compiler, node) => `[^${compiler.all(node).join('')}]`

export default visitor
