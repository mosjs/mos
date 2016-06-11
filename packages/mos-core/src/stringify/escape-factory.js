export default escapeFactory
import entityPrefixLength from './entity-prefix-length'
import LIST_BULLETS from './list-bullets'

/**
 * Check whether `character` is alphanumeric.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is alphanumeric.
 */
function isAlphanumeric (character) {
  return /\w/.test(character) && character !== '_'
}

/*
 * Entities.
 */

const ENTITY_AMPERSAND = '&amp;'
const ENTITY_BRACKET_OPEN = '&lt;'
const ENTITY_COLON = '&#x3A;'

/**
 * Checks if a string starts with HTML entity.
 *
 * @example
 *   startsWithEntity('&copycat') // true
 *   startsWithEntity('&foo &amp &bar') // false
 *
 * @param {string} value - Value to check.
 * @return {number} - Whether `value` starts an entity.
 */
function startsWithEntity (value) {
  return entityPrefixLength(value) > 0
}

/**
 * Check if `character` is a valid alignment row character.
 *
 * @example
 *   isAlignmentRowCharacter(':') // true
 *   isAlignmentRowCharacter('=') // false
 *
 * @param {string} character - Character to check.
 * @return {boolean} - Whether `character` is a valid
 *   alignment row character.
 */
function isAlignmentRowCharacter (character) {
  return character === ':' ||
        character === '-' ||
        character === ' ' ||
        character === '|'
}

/**
 * Check if `index` in `value` is inside an alignment row.
 *
 * @example
 *   isInAlignmentRow(':--:', 2) // true
 *   isInAlignmentRow(':--:\n:-*-:', 9) // false
 *
 * @param {string} value - Value to check.
 * @param {number} index - Position in `value` to check.
 * @return {boolean} - Whether `index` in `value` is in
 *   an alignment row.
 */
function isInAlignmentRow (value, index) {
  const length = value.length
  const start = index
  let character

  while (++index < length) {
    character = value.charAt(index)

    if (character === '\n') {
      break
    }

    if (!isAlignmentRowCharacter(character)) {
      return false
    }
  }

  index = start

  while (--index > -1) {
    character = value.charAt(index)

    if (character === '\n') {
      break
    }

    if (!isAlignmentRowCharacter(character)) {
      return false
    }
  }

  return true
}

/**
 * Factory to escape characters.
 *
 * @example
 *   var escape = escapeFactory({ commonmark: true });
 *   escape('x*x', { type: 'text', value: 'x*x' }) // 'x\\*x'
 *
 * @param {Object} options - Compiler options.
 * @return {function(value, node, parent): string} - Function which
 *   takes a value and a node and (optionally) its parent and returns
 *   its escaped value.
 */
function escapeFactory (options) {
    /**
     * Escape punctuation characters in a node's value.
     *
     * @param {string} value - Value to escape.
     * @param {Object} node - Node in which `value` exists.
     * @param {Object} [parent] - Parent of `node`.
     * @return {string} - Escaped `value`.
     */
  return function escape (value, node, parent) {
    const self = this
    const gfm = options.gfm
    const commonmark = options.commonmark
    const pedantic = options.pedantic
    const siblings = parent && parent.children
    const index = siblings && siblings.indexOf(node)
    const prev = siblings && siblings[index - 1]
    const next = siblings && siblings[index + 1]
    let length = value.length
    let position = -1
    let queue = []
    const escaped = queue
    let afterNewLine
    let character
    let wordCharBefore
    let wordCharAfter

    if (prev) {
      afterNewLine = prev.type === 'text' && /\n\s*$/.test(prev.value)
    } else if (parent) {
      afterNewLine = parent.type === 'paragraph'
    }

    while (++position < length) {
      character = value.charAt(position)

      if (
          character === '\\' ||
          character === '`' ||
          character === '*' ||
          character === '[' ||
          (
              character === '_' &&
              /*
               * Delegate leading/trailing underscores
               * to the multinode version below.
               */
              position > 0 &&
              position < length - 1 &&
              (
                  pedantic ||
                  !isAlphanumeric(value.charAt(position - 1)) ||
                  !isAlphanumeric(value.charAt(position + 1))
              )
          ) ||
          (self.inLink && character === ']') ||
          (
              gfm &&
              character === '|' &&
              (
                  self.inTable ||
                  isInAlignmentRow(value, position)
              )
          )
      ) {
        afterNewLine = false
        queue.push('\\')
      } else if (character === '<') {
        afterNewLine = false

        if (commonmark) {
          queue.push('\\')
        } else {
          queue.push(ENTITY_BRACKET_OPEN)
          continue
        }
      } else if (
          gfm &&
          !self.inLink &&
          character === ':' &&
          (
              queue.slice(-6).join('') === 'mailto' ||
              queue.slice(-5).join('') === 'https' ||
              queue.slice(-4).join('') === 'http'
          )
      ) {
        afterNewLine = false

        if (commonmark) {
          queue.push('\\')
        } else {
          queue.push(ENTITY_COLON)
          continue
        }
            /* istanbul ignore if - Impossible to test with
             * the current set-up.  We need tests which try
             * to force markdown content into the tree. */
      } else if (
          character === '&' &&
          startsWithEntity(value.slice(position))
      ) {
        afterNewLine = false

        if (commonmark) {
          queue.push('\\')
        } else {
          queue.push(ENTITY_AMPERSAND)
          continue
        }
      } else if (
          gfm &&
          character === '~' &&
          value.charAt(position + 1) === '~'
      ) {
        queue.push('\\', '~')
        afterNewLine = false
        position += 1
      } else if (character === '\n') {
        afterNewLine = true
      } else if (afterNewLine) {
        if (
            character === '>' ||
            character === '#' ||
            LIST_BULLETS[character]
        ) {
          queue.push('\\')
          afterNewLine = false
        } else if (
                character !== ' ' &&
                character !== '\t' &&
                character !== '\r' &&
                character !== '\u000B' &&
                character !== '\f'
            ) {
          afterNewLine = false
        }
      }

      queue.push(character)
    }

        /*
         * Multi-node versions.
         */

    if (siblings && node.type === 'text') {
      /*
       * Check for an opening parentheses after a
       * link-reference (which can be joined by
       * white-space).
       */

      if (
          prev &&
          prev.referenceType === 'shortcut'
      ) {
        position = -1
        length = escaped.length

        while (++position < length) {
          character = escaped[position]

          if (character === ' ' || character === '\t') {
            continue
          }

          if (character === '(') {
            escaped[position] = `\\${character}`
          }

          if (character === ':') {
            if (commonmark) {
              escaped[position] = `\\${character}`
            } else {
              escaped[position] = ENTITY_COLON
            }
          }

          break
        }
      }

      /*
       * Ensure non-auto-links are not seen as links.
       * This pattern needs to check the preceding
       * nodes too.
       */

      if (
          gfm &&
          !self.inLink &&
          prev &&
          prev.type === 'text' &&
          value.charAt(0) === ':'
      ) {
        queue = prev.value.slice(-6)

        if (
            queue === 'mailto' ||
            queue.slice(-5) === 'https' ||
            queue.slice(-4) === 'http'
        ) {
          if (commonmark) {
            escaped.unshift('\\')
          } else {
            escaped.splice(0, 1, ENTITY_COLON)
          }
        }
      }

      /*
       * Escape '&' if it would otherwise
       * start an entity.
       */

      if (
          next &&
          next.type === 'text' &&
          value.slice(-1) === '&' &&
          startsWithEntity(`&${next.value}`)
      ) {
        if (commonmark) {
          escaped.splice(escaped.length - 1, 0, '\\')
        } else {
          escaped.push('amp', ';')
        }
      }

      /*
       * Escape double tildes in GFM.
       */

      if (
          gfm &&
          next &&
          next.type === 'text' &&
          value.slice(-1) === '~' &&
          next.value.charAt(0) === '~'
      ) {
        escaped.splice(escaped.length - 1, 0, '\\')
      }

      /*
       * Escape underscores, but not mid-word (unless
       * in pedantic mode).
       */

      wordCharBefore = (
          prev &&
          prev.type === 'text' &&
          isAlphanumeric(prev.value.slice(-1))
      )

      wordCharAfter = (
          next &&
          next.type === 'text' &&
          isAlphanumeric(next.value.charAt(0))
      )

      if (length <= 1) {
        if (
            value === '_' &&
            (
                pedantic ||
                !wordCharBefore ||
                !wordCharAfter
            )
        ) {
          escaped.unshift('\\')
        }
      } else {
        if (
            value.charAt(0) === '_' &&
            (
                pedantic ||
                !wordCharBefore ||
                /* istanbul ignore next - only for trees */
                !isAlphanumeric(value.charAt(1))
            )
        ) {
          escaped.unshift('\\')
        }

        if (
            value.slice(-1) === '_' &&
            (
                pedantic ||
                !wordCharAfter ||
                /* istanbul ignore next - only for trees */
                !isAlphanumeric(value.slice(-2).charAt(0))
            )
        ) {
          escaped.splice(escaped.length - 1, 0, '\\')
        }
      }
    }

    return escaped.join('')
  }
}
