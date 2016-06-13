const YAML_FENCE = '-'.repeat(3)
import Tokenizer from '../tokenizer'

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
const tokenizeYAMLFrontMatter: Tokenizer = function (parser, value, silent) {
  let content: string
  let queue: string

  if (
    !parser.options.yaml ||
    value.charAt(0) !== '-' ||
    value.charAt(1) !== '-' ||
    value.charAt(2) !== '-' ||
    value.charAt(3) !== '\n'
  ) {
    return false
  }

  let subvalue = `${YAML_FENCE}\n`
  content = queue = ''
  let index = 3
  const length = value.length

  while (++index < length) {
    const character = value.charAt(index)

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
        type: 'yaml',
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

  return false
}

tokenizeYAMLFrontMatter.onlyAtStart = true

export default tokenizeYAMLFrontMatter
