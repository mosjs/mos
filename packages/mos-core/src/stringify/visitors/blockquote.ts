import {Visitor} from '../visitor'
import block from './block'

const visitor: Visitor = (compiler, node) => {
  const values = block(compiler, node).split('\n')
  const result: string[] = []
  let index = -1

  while (++index < values.length) {
    const value = values[index]
    result[index] = (value ? ' ' : '') + value
  }

  return `>${result.join('\n>')}`
}

export default visitor
