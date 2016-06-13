import {TableNode} from '../../node'
import {SpecificVisitor} from '../visitor'
import table from 'markdown-table'

const visitor: SpecificVisitor<TableNode> = (compiler, node) => {
  let index = node.children.length
  const exit = compiler.enterTable()
  const result: string[][] = []

  while (index--) {
    result[index] = compiler.all(node.children[index])
  }

  exit()

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
