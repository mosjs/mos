import repeat from 'repeat-string'
import longestStreak from 'longest-streak'

export default (compiler, node) => {
  const ticks = repeat('`', longestStreak(node.value, '`') + 1)
  let start = ticks
  let end = ticks

  if (node.value.charAt(0) === '`') {
    start += ' '
  }

  if (node.value.charAt(node.value.length - 1) === '`') {
    end = ` ${end}`
  }

  return start + node.value + end
}
