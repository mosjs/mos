import {DefinitionNode} from '../../node'
import {SpecificVisitor} from '../visitor'

const visitor: SpecificVisitor<DefinitionNode> = (compiler, node) => `[^${node.identifier}]`

export default visitor
