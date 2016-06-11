import block from './block'

export default (compiler, node) => {
  const values = block(compiler, node).split('\n')
  const result = []
  let index = -1

  while (++index < values.length) {
    const value = values[index]
    result[index] = (value ? ' ' : '') + value
  }

  return `>${result.join('\n>')}`
}
