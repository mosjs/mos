import trim from 'trim'
import tryBlockTokenize from '../try-block-tokenize'

/**
 * Tokenise a blockquote.
 *
 * @example
 *   tokenizeBlockquote(eat, '> Foo')
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `blockquote` node.
 */
export default function tokenizeBlockquote (parser, value, silent) {
  const now = parser.eat.now()
  const indent = parser.indent(now.line)
  const values = []
  const contents = []
  const indents = []
  let index = 0

  while (index < value.length) {
    const character = value.charAt(index)

    if (character !== ' ' && character !== '\t') {
      break
    }

    index++
  }

  if (value.charAt(index) !== '>') {
    return
  }

  if (silent) {
    return true
  }

  index = 0

  return tokenizeEach(index)
    .then(() => {
      index = -1
      const add = parser.eat(values.join('\n'))

      while (++index < indents.length) {
        indent(indents[index])
      }

      return add(parser.renderBlockquote(contents.join('\n'), now))
    })

  function tokenizeEach (index) {
    if (index >= value.length) return Promise.resolve()

    let nextIndex = value.indexOf('\n', index)
    const startIndex = index
    let prefixed = false

    if (nextIndex === -1) {
      nextIndex = value.length
    }

    while (index < value.length) {
      const character = value.charAt(index)

      if (character !== ' ' && character !== '\t') {
        break
      }

      index++
    }

    if (value.charAt(index) === '>') {
      index++
      prefixed = true

      if (value.charAt(index) === ' ') {
        index++
      }
    } else {
      index = startIndex
    }

    const content = value.slice(index, nextIndex)

    if (!prefixed && !trim(content)) {
      index = startIndex
      return Promise.resolve()
    }

    const rest = value.slice(index)

    if (!prefixed) {
      if (parser.options.commonmark) {
        return tryBlockTokenize(parser, 'code', rest, true)
          .then(found => {
            if (found) return index

            return tryBlockTokenize(parser, 'fences', rest, true)
              .then(found => {
                if (found) return index

                return tryBlockTokenize(parser, 'heading', rest, true)
                  .then(found => {
                    if (found) return index

                    return tryBlockTokenize(parser, 'lineHeading', rest, true)
                      .then(found => {
                        if (found) return index

                        return tryBlockTokenize(parser, 'thematicBreak', rest, true)
                          .then(found => {
                            if (found) return index

                            return tryBlockTokenize(parser, 'html', rest, true)
                              .then(found => {
                                if (found) return index

                                return tryBlockTokenize(parser, 'list', rest, true)
                                  .then(found => {
                                    if (found) return index

                                    return nextNotCommonmark()
                                  })
                              })
                          })
                      })
                  })
              })
          })
      }

      return nextNotCommonmark()
    }

    return next()

    function next () {
      const line = startIndex === index
        ? content
        : value.slice(startIndex, nextIndex)

      indents.push(index - startIndex)
      values.push(line)
      contents.push(content)

      index = nextIndex + 1
      return tokenizeEach(index)
    }

    function nextNotCommonmark () {
      if (!parser.options.commonmark) {
        return tryBlockTokenize(parser, 'definition', rest, true)
          .then(found => {
            if (found) return index

            return tryBlockTokenize(parser, 'footnoteDefinition', rest, true)
              .then(found => {
                if (found) return index

                return next()
              })
          })
      }

      return next()
    }
  }
}
