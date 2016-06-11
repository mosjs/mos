import repeat from 'repeat-string'
const YAML_FENCE = repeat('-', 3)
import nodeTypes from '../node-types'

/**
 * Tokenise YAML front matter.
 *
 * @example
 *   tokenizeYAMLFrontMatter(eat, '---\nfoo: bar\n---');
 *
 * @property {boolean} onlyAtStart
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `yaml` node.
 */
export default function tokenizeYAMLFrontMatter (parser, value, silent) {
  let subvalue
  let content
  let index
  let length
  let character
  let queue

  if (
    !parser.options.yaml ||
    value.charAt(0) !== '-' ||
    value.charAt(1) !== '-' ||
    value.charAt(2) !== '-' ||
    value.charAt(3) !== '\n'
  ) {
    return
  }

  subvalue = `${YAML_FENCE}\n`
  content = queue = ''
  index = 3
  length = value.length

  while (++index < length) {
    character = value.charAt(index)

    if (
      character === '-' &&
      (queue || !content) &&
      value.charAt(index + 1) === '-' &&
      value.charAt(index + 2) === '-'
    ) {
        /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      subvalue += queue + YAML_FENCE

      return parser.eat(subvalue)({
        type: nodeTypes.YAML,
        value: content,
      })
    }

    if (character === '\n') {
      queue += character
    } else {
      subvalue += queue + character
      content += queue + character
      queue = ''
    }
  }
}

tokenizeYAMLFrontMatter.onlyAtStart = true
