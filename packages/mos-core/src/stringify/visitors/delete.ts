import {Visitor} from '../visitor'
const DOUBLE_TILDE = '~~'

const visitor: Visitor = (compiler, node) => DOUBLE_TILDE + compiler.all(node).join('') + DOUBLE_TILDE

export default visitor
