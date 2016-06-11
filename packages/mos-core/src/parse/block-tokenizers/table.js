import isWhiteSpace from '../is-white-space'
import nodeTypes from '../node-types'

const MIN_TABLE_COLUMNS = 2
const MIN_TABLE_ROWS = 2

/*
 * Available table alignments.
 */

const TABLE_ALIGN_LEFT = 'left'
const TABLE_ALIGN_CENTER = 'center'
const TABLE_ALIGN_RIGHT = 'right'
const TABLE_ALIGN_NONE = null

/**
 * Tokenise a table.
 *
 * @example
 *   tokenizeTable(eat, ' | foo |\n | --- |\n | bar |')
 *
 * @property {boolean} onlyAtTop
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `table` node.
 */
export default function tokenizeTable (parser, value, silent) {
  /*
   * Exit when not in gfm-mode.
   */

  if (!parser.options.gfm) {
    return
  }

  /*
   * Get the rows.
   * Detecting tables soon is hard, so there are some
   * checks for performance here, such as the minimum
   * number of rows, and allowed characters in the
   * alignment row.
   */

  let lineCount = 0
  let index = 0
  const lines = []

  while (index <= value.length) {
    let lineIndex = value.indexOf('\n', index)
    const pipeIndex = value.indexOf('|', index + 1)

    if (lineIndex === -1) {
      lineIndex = value.length
    }

    if (
      pipeIndex === -1 ||
      pipeIndex > lineIndex
    ) {
      if (lineCount < MIN_TABLE_ROWS) {
        return
      }

      break
    }

    lines.push(value.slice(index, lineIndex))
    lineCount++
    index = lineIndex + 1
  }

  /*
   * Parse the alignment row.
   */

  let subvalue = lines.join('\n')
  const alignments = lines.splice(1, 1)[0] || []
  index = 0
  lineCount--
  let alignment = false
  const align = []
  let hasDash
  let first

  while (index < alignments.length) {
    const character = alignments.charAt(index)

    if (character === '|') {
      hasDash = null

      if (alignment === false) {
        if (first === false) {
          return
        }
      } else {
        align.push(alignment)
        alignment = false
      }

      first = false
    } else if (character === '-') {
      hasDash = true
      alignment = alignment || TABLE_ALIGN_NONE
    } else if (character === ':') {
      if (alignment === TABLE_ALIGN_LEFT) {
        alignment = TABLE_ALIGN_CENTER
      } else if (hasDash && alignment === TABLE_ALIGN_NONE) {
        alignment = TABLE_ALIGN_RIGHT
      } else {
        alignment = TABLE_ALIGN_LEFT
      }
    } else if (!isWhiteSpace(character)) {
      return
    }

    index++
  }

  if (alignment !== false) {
    align.push(alignment)
  }

  /*
   * Exit when without enough columns.
   */

  if (align.length < MIN_TABLE_COLUMNS) {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  return parser.eat(subvalue).reset({
    type: nodeTypes.TABLE,
    align,
    children: [],
  })
  .then(table => {
    return eachRow(lines, 0)

    function eachRow (lines, position) {
      if (!lines.length) return
      const line = lines.shift()
      const row = {
        type: position ? nodeTypes.TABLE_ROW : nodeTypes.TABLE_HEADER,
        children: [],
      }

      /*
       * Eat a newline character when this is not the
       * first row.
       */

      if (position) {
        parser.eat('\n')
      }

      /*
       * Eat the row.
       */

      return parser.eat(line)
        .reset(row, table)
        .then(() => {
          let queue = ''
          let cell = ''
          let preamble = true
          let opening = null

          return eachCharacter(line.split('').concat(''))

          function eachCharacter (line) {
            if (!line.length) {
              /*
               * Eat the alignment row.
               */
              if (!position) {
                parser.eat(`\n${alignments}`)
              }

              return
            }

            let index = 0
            const character = line[index]

            if (character === '\t' || character === ' ') {
              if (cell) {
                queue += character
              } else {
                parser.eat(character)
              }

              return eachCharacter(line.slice(1))
            }

            if (character === '' || character === '|') {
              if (preamble) {
                parser.eat(character)
              } else {
                if (character && opening) {
                  queue += character
                  return eachCharacter(line.slice(1))
                }

                if ((cell || character) && !preamble) {
                  subvalue = cell

                  if (queue.length > 1) {
                    if (character) {
                      subvalue += queue.slice(0, queue.length - 1)
                      queue = queue.charAt(queue.length - 1)
                    } else {
                      subvalue += queue
                      queue = ''
                    }
                  }

                  const now = parser.eat.now()

                  return parser.eat(subvalue)(
                    parser.renderInline(nodeTypes.TABLE_CELL, cell, now), row
                  )
                  .then(() => {
                    parser.eat(queue + character)

                    queue = ''
                    cell = ''

                    return eachCharacter(line.slice(1))
                  })
                }

                parser.eat(queue + character)

                queue = ''
                cell = ''

                return eachCharacter(line.slice(1))
              }
            } else {
              if (queue) {
                cell += queue
                queue = ''
              }

              cell += character

              if (character === '\\' && index !== line.length - 1) {
                cell += line[index + 1]
                index++
              }

              if (character === '`') {
                let count = 1

                while (line[index + 1] === character) {
                  cell += character
                  index++
                  count++
                }

                if (!opening) {
                  opening = count
                } else if (count >= opening) {
                  opening = 0
                }
              }
            }

            preamble = false
            return eachCharacter(line.slice(index + 1))
          }
        })
        .then(() => eachRow(lines, position + 1))
    }
  })
}

tokenizeTable.onlyAtTop = true
