import isWhiteSpace from '../is-white-space'
import Tokenizer from '../tokenizer'
import {Node} from '../../node'

const MIN_TABLE_COLUMNS = 2
const MIN_TABLE_ROWS = 2

/*
 * Available table alignments.
 */

const TABLE_ALIGN_LEFT = 'left'
const TABLE_ALIGN_CENTER = 'center'
const TABLE_ALIGN_RIGHT = 'right'
const TABLE_ALIGN_NONE: string = null

/**
 * Tokenise a table.
 *
 * @example
 *   tokenizeTable(eat, ' | foo |\n | --- |\n | bar |')
 *
 * @property {boolean} notInList
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `table` node.
 */
const tokenizeTable: Tokenizer = function (parser, value, silent) {
  /*
   * Exit when not in gfm-mode.
   */

  if (!parser.options.gfm) {
    return false
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
  const lines: string[] = []

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
        return false
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
  const alignments = lines.splice(1, 1)[0]
  index = 0
  lineCount--
  let alignment: any = false
  const align: string[] = []
  let hasDash: boolean
  let first: boolean

  while (alignments && index < alignments.length) {
    const character = alignments.charAt(index)

    if (character === '|') {
      hasDash = null

      if (alignment === false) {
        if (first === false) {
          return false
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
      return false
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
    return false
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  return parser.eat(subvalue).reset({
    type: 'table',
    align,
    children: [],
  })
  .then(table => {
    return eachRow(lines, 0)

    function eachRow (lines: string[], position: number): Promise<void> {
      if (!lines.length) {
        return undefined
      }
      const line = lines.shift()
      const row: Node = {
        type: 'tableRow',
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
          let opening: number = null

          return eachCharacter(line.split('').concat(''))

          function eachCharacter (line: string[]): Promise<void> {
            if (!line.length) {
              /*
               * Eat the alignment row.
               */
              if (!position) {
                parser.eat(`\n${alignments}`)
              }

              return undefined
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
                    parser.tokenizeInline(cell, now)
                      .then(children => (<Node>{ type: 'tableCell', children })), row
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

tokenizeTable.notInList = true

export default tokenizeTable
