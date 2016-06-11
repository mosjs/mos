export default eatHTMLProcessingInstruction

/**
 * Try to match a processing instruction.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the processing
 *   instruction at the start of `value`.
 */
function eatHTMLProcessingInstruction (value) {
  let index = 0
  let queue = ''
  const length = value.length
  let character

  if (
      value.charAt(index) === '<' &&
      value.charAt(++index) === '?'
  ) {
    queue = '<?'
    index++

    while (index < length) {
      character = value.charAt(index)

      if (
        character === '?' &&
        value.charAt(index + 1) === '>'
      ) {
        return `${queue + character}>`
      }

      queue += character
      index++
    }
  }
}
