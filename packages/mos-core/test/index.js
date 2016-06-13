import path from 'path'
import fs from 'fs'
import assert from 'assert'
import extend from 'extend'
import * as mosCore from '../dist/esnext'
import fixtures from './fixtures.js'
import {expect} from 'chai'
import {describe, it} from 'mocha'

/*
 * Settings.
 */

/**
 * Construct an empty node.
 *
 * @return {Node} - Empty `root` node.
 */
function empty () {
  return {
    type: 'root',
    children: [],
  }
}

/*
 * Tests.
 */

function parse (md, opts) {
  return mosCore.parser(mosCore)(md, opts)
}

function stringify (ast, opts) {
  return mosCore.compiler(mosCore.visitors)(ast, opts)
}

describe('parse(file, options?)', () => {
  it('should accept a `string`', done => {
    return parse('Alfred', {})
      .then(node => {
        expect(node.children.length).to.eq(1)
        done()
      })
      .catch(done)
  })

  it('should throw when `options` is not an object', () => {
    assert.throws(() => {
      parse('', false)
    }, /options/)
  })

  it('should throw when `options.position` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        position: 0,
      })
    }, /options.position/)
  })

  it('should throw when `options.gfm` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        gfm: Infinity,
      })
    }, /options.gfm/)
  })

  it('should throw when `options.footnotes` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        footnotes: 1,
      })
    }, /options.footnotes/)
  })

  it('should throw when `options.breaks` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        breaks: 'unicorn',
      })
    }, /options.breaks/)
  })

  it('should throw when `options.pedantic` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        pedantic: {},
      })
    }, /options.pedantic/)
  })

  it('should throw when `options.yaml` is not a boolean', () => {
    assert.throws(() => {
      parse('', {
        yaml: [true],
      })
    }, /options.yaml/)
  })

  it.skip('should throw parse errors', done => {
    const message = 'Found it!'

    /**
     * Tokenizer.
     *
     * @param {Function} eat - Eater.
     * @param {string} value - Rest of content.
     */
    function emphasis (parser, value) {
      if (value.charAt(0) === '*') {
        parser.eat.file.fail(message, parser.eat.now())
      }
    }

    /**
     * Locator.
     *
     * @param {string} value - Value to search.
     * @param {number} fromIndex - Index to start searching at.
     * @return {number} - Location of possible auto-link.
     */
    function locator (parser, value, fromIndex) {
      return value.indexOf('*', fromIndex)
    }

    emphasis.locator = locator
    const inlineTokenizers = mosCore.inlineTokenizers.slice()
    const emphasisIndex = inlineTokenizers.findIndex(t => t.name === 'emphasis')
    inlineTokenizers.splice(emphasisIndex, 1, {
      name: 'emphasis',
      func: emphasis,
    })

    const parse = mosCore.parser(Object.assign({}, mosCore, { inlineTokenizers }))

    parse('Hello *World*!')
      .catch(exception => {
        assert(exception.file === '')
        assert(exception.line === 1)
        assert(exception.column === 7)
        assert(exception.reason === message)
        assert(exception.toString() === `1:7: ${message}`)
        done()
      })
  })

  it('should warn when missing locators', done => {
    const file = 'Hello *World*!'

    /** Tokenizer. */
    function noop () {}

    const inlineTokenizers = mosCore.inlineTokenizers.slice()

    inlineTokenizers.splice(inlineTokenizers.length - 1, 0, {
      name: 'foo',
      func: noop,
    })

    const parse = mosCore.parser(Object.assign({}, mosCore, { inlineTokenizers }))
    return parse(file)
      .catch(err => {
        assert.equal(err.message, 'Missing locator: `foo`')
        done()
      })
  })

  it.skip('should warn with entity messages', done => {
    const filePath = path.join('test', 'input', 'entities-advanced.text')
    const doc = fs.readFileSync(filePath, 'utf8')
    const file = doc
    const notTerminated = 'Named character references must be terminated by a semicolon'

    file.quiet = true

    let remark = null
    remark.process(file)
      .then(() => {
        assert.deepEqual(file.messages.map(String), [
          '1:13: Named character references must be known',
          `5:15: ${notTerminated}`,
          `10:14: ${notTerminated}`,
          `12:38: ${notTerminated}`,
          `15:16: ${notTerminated}`,
          `15:37: ${notTerminated}`,
          `14:16: ${notTerminated}`,
          `18:17: ${notTerminated}`,
          `19:21: ${notTerminated}`,
          `17:16: ${notTerminated}`,
          `24:16: ${notTerminated}`,
          `24:37: ${notTerminated}`,
          `22:11: ${notTerminated}`,
          `29:17: ${notTerminated}`,
          `30:21: ${notTerminated}`,
          `28:17: ${notTerminated}`,
          `33:11: ${notTerminated}`,
          `36:27: ${notTerminated}`,
          `37:10: ${notTerminated}`,
          `41:25: ${notTerminated}`,
          `42:10: ${notTerminated}`,
        ])
        done()
      })
      .catch(done)
  })

  it('should be able to set options', done => {
    const blockTokenizers = mosCore.blockTokenizers.slice()
    const htmlIndex = blockTokenizers.findIndex(t => t.name === 'html')
    const originalTokenizer = blockTokenizers[htmlIndex]

    /**
     * Set option when an HTML comment occurs:
     * `<!-- $key -->`, turns on `$key`.
     *
     * @param {function(string)} eat - Eater.
     * @param {string} value - Rest of content.
     */
    function replacement (parser, value) {
      const node = /<!--\s*(.*?)\s*-->/g.exec(value)
      const options = {}

      if (node) {
        options[node[1]] = true

        parser.setOptions(options)
      }

      return originalTokenizer.func.apply(null, arguments)
    }

    const newTokenizer = Object.assign({}, originalTokenizer, { func: replacement })

    blockTokenizers.splice(htmlIndex, 1, newTokenizer)

    const parse = mosCore.parser(Object.assign({}, mosCore, { blockTokenizers }))
    return parse([
      '<!-- commonmark -->',
      '',
      '1)   Hello World',
      '',
    ].join('\n'))
    .then(result => {
      assert(result.children[1].type === 'list')
      done()
    })
    .catch(done)
  })
})

describe('stringify(ast, file, options?)', () => {
  it('should throw when `ast` is not an object', () => {
    assert.throws(() => {
      stringify(false)
    }, /false/)
  })

  it('should throw when `ast` is not a valid node', () => {
    assert.throws(() => {
      stringify({
        type: 'unicorn',
      })
    }, /unicorn/)
  })

  it.skip('should not throw when given a parsed file', done => {
    const file = 'foo'

    parse(file)
      .then(() => {
        assert.doesNotThrow(() => {
          stringify(file)
        })
        done()
      })
      .catch(done)
  })

  it('should throw when `options` is not an object', () => {
    assert.throws(() => {
      stringify(empty(), false)
    }, /options/)
  })

  it('should throw when `options.bullet` is not a valid list bullet', () => {
    assert.throws(() => {
      stringify(empty(), {
        bullet: true,
      })
    }, /options\.bullet/)
  })

  it('should throw when `options.listItemIndent` is not a valid constant', () => {
    assert.throws(() => {
      stringify(empty(), {
        listItemIndent: 'foo',
      })
    }, /options\.listItemIndent/)
  })

  it('should throw when `options.rule` is not a valid horizontal rule bullet', () => {
    assert.throws(() => {
      stringify(empty(), {
        rule: true,
      })
    }, /options\.rule/)
  })

  it('should throw when `options.ruleSpaces` is not a boolean', () => {
    assert.throws(() => stringify(empty(), { ruleSpaces: 1 }), /options\.ruleSpaces/)
  })

  it('should throw when `options.ruleRepetition` is not a valid repetition count', () => {
    assert.throws(() => {
      stringify(empty(), {
        'ruleRepetition': 1,
      })
    }, /options\.ruleRepetition/)

    assert.throws(() => {
      stringify(empty(), {
        'ruleRepetition': NaN,
      })
    }, /options\.ruleRepetition/)

    assert.throws(() => {
      stringify(empty(), {
        'ruleRepetition': true,
      })
    }, /options\.ruleRepetition/)
  })

  it('should throw when `options.emphasis` is not a valid emphasis marker', () => {
    assert.throws(() => {
      stringify(empty(), {
        'emphasis': '-',
      })
    }, /options\.emphasis/)
  })

  it('should throw when `options.strong` is not a valid emphasis marker', () => {
    assert.throws(() => {
      stringify(empty(), {
        'strong': '-',
      })
    }, /options\.strong/)
  })

  it('should throw when `options.setext` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        'setext': 0,
      })
    }, /options\.setext/)
  })

  it('should throw when `options.incrementListMarker` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        'incrementListMarker': -1,
      })
    }, /options\.incrementListMarker/)
  })

  it('should throw when `options.fences` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        fences: NaN,
      })
    }, /options\.fences/)
  })

  it('should throw when `options.fence` is not a ' +
    'valid fence marker',
    () => {
      assert.throws(() => {
        stringify(empty(), {
          'fence': '-',
        })
      }, /options\.fence/)
    }
  )

  it('should throw when `options.closeAtx` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        'closeAtx': NaN,
      })
    }, /options\.closeAtx/)
  })

  it('should throw when `options.looseTable` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        'looseTable': 'Hello!',
      })
    }, /options\.looseTable/)
  })

  it('should throw when `options.spacedTable` is not a boolean', () => {
    assert.throws(() => {
      stringify(empty(), {
        spacedTable: 'World',
      })
    }, /options\.spacedTable/)
  })

  it('should be able to set options', done => {
    const html = mosCore.visitors.html

    const parse = mosCore.parser(mosCore)
    parse([
      '<!-- setext -->',
      '',
      '# Hello World',
      '',
    ].join('\n'))
    .then(ast => {
      /**
       * Set option when an HMTL comment occurs:
       * `<!-- $key -->`, turns on `$key`.
       *
       * @param {Object} node - Node to compile.
       * @return {string} - Compiled `node`.
       */
      function replacement (compiler, node) {
        const value = node.value
        const result = /<!--\s*(.*?)\s*-->/g.exec(value)
        const options = {}

        if (result) {
          options[result[1]] = true

          compiler.setOptions(options)
        }

        return html(...arguments)
      }

      const visitors = Object.assign({}, mosCore.visitors, { html: replacement })

      const compile = mosCore.compiler(visitors)
      assert(compile(ast) === [
        '<!-- setext -->',
        '',
        'Hello World',
        '===========',
        '',
      ].join('\n'))

      done()
    })
    .catch(done)
  })
})

let validateToken
let validateTokens

/**
 * Validate `children`.
 *
 * @param {Array.<Object>} children - Nodes to validate.
 */
validateTokens = children => {
  children.forEach(validateToken)
}

/**
 * Validate `context`.
 *
 * @param {Object} context - Node to validate.
 */
validateToken = context => {
  let keys = Object.keys(context).length
  const type = context.type

  expect(context.type).to.exist

  if ('children' in context) {
    assert(Array.isArray(context.children))
    validateTokens(context.children)
  }

    /*
     * Validate position.
     */

  if (context.position) {
    assert('start' in context.position)
    assert('end' in context.position)

    assert('line' in context.position.start)
    assert('column' in context.position.start)

    assert('line' in context.position.end)
    assert('column' in context.position.end)
  }

  if ('position' in context) {
    keys--
  }

  if ('value' in context) {
    assert(typeof context.value === 'string')
  }

  if (type === 'root') {
    assert('children' in context)

    if (context.footnotes) {
      Object.keys(context.footnotes).forEach(id => {
        validateToken(context.footnotes[id])
      })
    }

    return
  }

  if (
      type === 'paragraph' ||
      type === 'blockquote' ||
      type === 'tableRow' ||
      type === 'tableCell' ||
      type === 'strong' ||
      type === 'emphasis' ||
      type === 'delete'
  ) {
    assert(keys === 2)
    assert('children' in context)

    return
  }

  if (type === 'listItem') {
    assert(keys === 3 || keys === 4)
    assert('children' in context)
    assert(typeof context.loose === 'boolean')

    if (keys === 4) {
      assert(
          context.checked === true ||
          context.checked === false ||
          context.checked === null
      )
    }

    return
  }

  if (type === 'footnote') {
    assert(keys === 2)
    assert('children' in context)

    return
  }

  if (type === 'heading') {
    assert(keys === 3)
    assert(context.depth > 0)
    assert(context.depth <= 6)
    assert('children' in context)

    return
  }

  if (
      type === 'text' ||
      type === 'inlineCode' ||
      type === 'yaml'
  ) {
    assert(keys === 2)
    assert('value' in context)

    return
  }

  if (type === 'code') {
    assert(keys === 3)
    assert('value' in context)

    assert(
        context.lang === null ||
        typeof context.lang === 'string'
    )

    return
  }

  if (type === 'thematicBreak' || type === 'break') {
    assert(keys === 1)

    return
  }

  if (type === 'list') {
    assert('children' in context)
    assert(typeof context.ordered === 'boolean')
    expect(context.loose).to.be.a('boolean')
    assert(keys === 5)

    if (context.ordered) {
      assert(typeof context.start === 'number')
      assert(context.start === context.start)
    } else {
      assert(context.start === null)
    }

    return
  }

  if (type === 'footnoteDefinition') {
    assert(keys === 3)
    assert('children' in context)
    assert(typeof context.identifier === 'string')

    return
  }

  if (type === 'definition') {
    assert(typeof context.identifier === 'string')

    assert(
      context.title === null ||
      typeof context.title === 'string'
    )

    assert(typeof context.url === 'string')
    assert(context.link === undefined)

    assert(keys === 4)

    return
  }

  if (type === 'link') {
    assert('children' in context)
    assert(
      context.title === null ||
      typeof context.title === 'string'
    )
    assert(typeof context.url === 'string')
    assert(context.href === undefined)
    assert(keys === 4)

    return
  }

  if (type === 'image') {
    assert(
      context.title === null ||
      typeof context.title === 'string'
    )
    assert(
      context.alt === null ||
      typeof context.alt === 'string'
    )
    assert(typeof context.url === 'string')
    assert(context.src === undefined)
    assert(keys === 4)

    return
  }

  if (type === 'linkReference') {
    assert('children' in context)
    assert(typeof context.identifier === 'string')

    assert(
      context.referenceType === 'shortcut' ||
      context.referenceType === 'collapsed' ||
      context.referenceType === 'full'
    )

    assert(keys === 4)

    return
  }

  if (type === 'imageReference') {
    assert(typeof context.identifier === 'string')

    assert(
      context.alt === null ||
      typeof context.alt === 'string'
    )

    assert(
      context.referenceType === 'shortcut' ||
      context.referenceType === 'collapsed' ||
      context.referenceType === 'full'
    )

    assert(keys === 4)

    return
  }

  if (type === 'footnoteReference') {
    assert(typeof context.identifier === 'string')
    assert(keys === 2)

    return
  }

  if (type === 'table') {
    assert(keys === 3)
    assert('children' in context)

    assert(Array.isArray(context.align))

    context.align.forEach(align => {
      assert(
        align === null ||
        align === 'left' ||
        align === 'right' ||
        align === 'center'
      )
    })

    return
  }

    /* This is the last possible type. If more types are added, they
     * should be added before this block, or the type:html tests should
     * be wrapped in an if statement. */
  assert(type === 'html')
  assert(keys === 2)
  assert('value' in context)
}

/**
 * Compress array of nodes by merging adjacent text nodes when possible.
 *
 * This usually happens inside Parser, but it also needs to be done whenever
 * position info is stripped from the AST.
 *
 * @param {Array.<Object>} nodes - Nodes to merge.
 * @return {Array.<Object>} - Merged nodes.
 */
function mergeTextNodes (nodes) {
  if (!nodes.length || nodes[0].position) {
    return nodes
  }

  const result = [nodes[0]]

  nodes.slice(1).forEach(node => {
    if (node.type === 'text' && result[result.length - 1].type === 'text') {
      result[result.length - 1].value += node.value
    } else {
      result.push(node)
    }
  })

  return result
}

/**
 * Clone, and optionally clean from `position`, a node.
 *
 * @param {Object} node - Node to clone.
 * @param {boolean} clean - Whether to clean.
 * @return {Object} - Cloned node.
 */
function clone (node, clean) {
  const result = Array.isArray(node) ? [] : {}

  Object.keys(node).forEach(key => {
    const value = node[key]

    if (value === undefined) {
      return
    }

    /*
     * Remove `position` when needed.
     */

    if (clean && key === 'position') {
      return
    }

    /*
     * Ignore `checked` attributes set to `null`,
     * which only exist in `gfm` on list-items
     * without a checkbox.  This ensures less
     * needed fixtures.
     */

    if (key === 'checked' && value === null) {
      return
    }

    if (value !== null && typeof value === 'object') {
      result[key] = clone(value, clean)
      if (key === 'children') {
        result[key] = mergeTextNodes(result[key])
      }
    } else {
      result[key] = value
    }
  })

  return result
}

/*
 * Methods.
 */

/**
 * Diff node.
 *
 * @param {Node} node - Node to diff.
 * @param {Node} baseline - Baseline reference.
 * @param {boolean} clean - Whether to clean `node`.
 * @param {boolean} cleanBaseline - Whether to clean
 *   `baseline`.
 */
function compare (node, baseline, clean, cleanBaseline) {
  validateToken(node)

  if (clean && !cleanBaseline) {
    cleanBaseline = true
  }

  expect(clone(node, clean)).to.eql(clone(baseline, cleanBaseline))
}

/*
 * Fixtures.
 */

describe('fixtures', function () {
  this.timeout(10e3) // 10 seconds
  let fixtureNo = 0
  fixtures.forEach(fixture => {
    describe(`fixture #${++fixtureNo}, ${fixture.name}`, () => {
      const input = fixture.input
      const possibilities = fixture.possibilities
      const mapping = fixture.mapping
      const trees = fixture.trees
      const output = fixture.output

      Object.keys(possibilities).forEach(key => {
        const name = key || 'default'
        const parseOpts = possibilities[key]
        const stringifyOpts = extend({}, fixture.stringify, {
          gfm: parseOpts.gfm,
          commonmark: parseOpts.commonmark,
          pedantic: parseOpts.pedantic,
        })
        const initialClean = !parseOpts.position
        let node
        let markdown

        it(`should parse \`${name}\` correctly`, done => {
          return parse(input, parseOpts)
            .then(node_ => {
              node = node_

              /*
               * The first assertion should not clean positional
               * information, except when `position: false`: in that
               * case the baseline should be stripped of positional
               * information.
               */

              compare(node, trees[mapping[key]], false, initialClean)

              markdown = stringify(node, stringifyOpts)

              done()
            })
            .catch(done)
        })

        if (output !== false) {
          it(`should stringify \`${name}\``, done => {
            return parse(markdown, parseOpts)
              .then(res => {
                compare(node, res, true)
                done()
              })
              .catch(done)
          })
        }

        if (output === true) {
          it(`should stringify \`${name}\` exact`, () => {
            expect(markdown).to.eq(fixture.input)
          })
        }
      })
    })
  })
})
