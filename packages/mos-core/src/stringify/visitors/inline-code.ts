import {Visitor} from '../visitor'
import longestStreak from 'longest-streak'

const visitor: Visitor = (compiler, node) => {
  const ticks = '`'.repeat(longestStreak(node.value, '`') + 1)
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

export default visitor
