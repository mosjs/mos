import {Compiler} from './compiler'
import {Node} from '../node'

export type SpecificVisitor<T extends Node> = (compiler: Compiler, node: T, parent?: Node) => string
export type Visitor = SpecificVisitor<Node>
export type VisitorsMap = {[type: string]: Visitor}
