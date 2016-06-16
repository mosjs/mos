import {TableNode} from '../../node'
import {SpecificVisitor} from '../visitor'
import table from 'markdown-table'

const visitor: SpecificVisitor<TableNode> = (compiler, node) => {
  let index = node.children.length
  compiler.context.inTable = true
  const result: string[][] = []

  while (index--) {
    result[index] = compiler.all(node.children[index])
  }

  compiler.context.inTable = false

  const start = compiler.options.looseTable
    ? ''
    : compiler.options.spacedTable ? '| ' : '|'

  return table(result, {
    align: node.align,
    start,
    end: start.split('').reverse().join(''),
    delimiter: compiler.options.spacedTable ? ' | ' : '|',
  })
}

export default visitor
