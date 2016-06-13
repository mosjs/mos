import {Visitor} from '../visitor'
import block from './block'

const visitor: Visitor = (compiler, node) => `${block(compiler, node)}\n`

export default visitor
