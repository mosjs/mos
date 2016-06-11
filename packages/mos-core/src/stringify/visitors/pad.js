import repeat from 'repeat-string'
const INDENT = 4

export default function pad (value, level) {
  value = value.split('\n')

  let index = value.length
  const padding = repeat(' ', level * INDENT)

  while (index--) {
    if (value[index].length !== 0) {
      value[index] = padding + value[index]
    }
  }

  return value.join('\n')
};
