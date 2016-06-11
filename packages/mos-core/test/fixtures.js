import fs from 'fs'
import path from 'path'
import camelcase from 'camelcase'
import clone from 'clone'
import * as defaults from '../src/defaults.js'

/*
 * Methods.
 */

const read = fs.readFileSync
const exists = fs.existsSync
const stat = fs.statSync
const join = path.join

const typeMap = {
  'true': 'all',
  'false': 'physical',
}

const TYPE = typeMap[Boolean(process.env.TEST_EXTENDED)]

/*
 * Defaults.
 */

const keys = Object.keys(defaults.parse)

/*
 * Create a single source with all parse options turned
 * to their default values.
 */

let sources = [keys.join('.')]

/*
 * Create all possible `parse` values.
 */

keys.forEach(key => {
  sources = [].concat.apply(sources, sources.map(source => source.split('.').map(subkey => subkey === key ? `no${key}` : subkey).join('.')))
})

/**
 * Parse a `string` `value` into a javascript value.
 *
 * @param {string} key - Name of setting.
 * @param {string} value - Associated value.
 * @return {Object} - Parsed value.
 */
function augment (key, value) {
  if (!value) {
    value = key.slice(0, 2) !== 'no'

    if (!value) {
      key = key.slice(2)
    }
  }

  key = camelcase(key)

  if (augment.hasOwnProperty(key)) {
    value = augment[key](value)
  }

  return { key, value }
}

augment.ruleRepetition = Number

/**
 * Parse options from a filename.
 *
 * @param {string} name - File-name to parse.
 * @return {Object} - Configuration.
 */
function parseOptions (name) {
  let index = -1
  const parts = name.split('.')
  const results = []
  const length = parts.length
  const options = clone(defaults)
  let part

  while (++index < length) {
    part = parts[index].split('=')
    const {key, value} = augment(part[0], part.slice(1).join('='))

    if (key === 'output') {
      options[key] = value
    } else {
      if (key in defaults.parse && value !== options.parse[key]) {
        options.parse[key] = value

        results.push(parts[index])
      }

      if (
          key in defaults.stringify &&
          value !== options.stringify[key]
      ) {
        options.stringify[key] = value

          // Protect common options from `parse` and `stringify` from
          // appearing twice.
        if (results.indexOf(parts[index]) < 0) {
          results.push(parts[index])
        }
      }
    }
  }

  options.source = results.join('.')

  return options
}

/*
 * Cache all possible options.
 *
 * Virtual options are generated when no fixtures exist,
 * whereas physical options are only used whn a file
 * exists.
 */

const virtual = {}
const physical = {}
const all = {}

sources.forEach(source => {
  const options = parseOptions(source)

  source = options.source

    /*
     * Breaks are such a tiny feature, but almost
     * certainly result in duplicate fixtures,
     * that I've ignored it for the virtual
     * options.
     *
     * Same for `position`.
     */

  if (
      options.parse.breaks !== defaults.parse.breaks ||
      options.parse.position !== defaults.parse.position
  ) {
    physical[source] = options.parse
  } else {
    virtual[source] = options.parse
  }

  all[source] = options.parse
})

/**
 * Get the difference between two objects.  Greatly
 * simplified because `options` and `compate` consist
 * solely of booleans, and all properties exist in
 * both.
 *
 * @param {Object} options - Configuration.
 * @param {Object} compare - Object to compare to.
 * @return {number} - Difference.
 */
function difference (options, compare) {
  let count = 0

  Object.keys(options).forEach(key => {
    if (options[key] !== compare[key]) {
      count++
    }
  })

  return count
}

/**
 * Find the closest fixture for a `source` in all
 * `fixtures`.  Returns a key of a fixture.
 *
 * @param {string} source - File-name to resolve.
 * @param {Object} fixtures - Available fixtures.
 * @param {Object} options - Configuration.
 * @return {string} - Resolved file-name.
 */
function resolveFixture (source, fixtures, options) {
  let minimum = Infinity
  let resolved
  let offset

  Object.keys(fixtures).forEach(key => {
    offset = difference(options[source], options[key])

    if (offset < minimum) {
      minimum = offset
      resolved = key
    }
  })

  return resolved
}

/**
 * Find the closest fixture for all `options`.  Returns
 * an object mapping options sources to fixture names.
 *
 * @param {Object} fixtures - Map of fixtures.
 * @param {Object} options - Configuration.
 * @return {Object} - Resolved fixtures.
 */
function resolveFixtures (fixtures, options) {
  const resolved = {}

  Object.keys(options).forEach(source => {
    resolved[source] = resolveFixture(source, fixtures, options)
  })

  return resolved
}

/*
 * Gather fixtures.
 */

const tests = fs.readdirSync(join(__dirname, 'input'))
    .filter(filepath => filepath.indexOf('.') !== 0).map(filepath => {
      const filename = filepath.split('.').slice(0, -1)
      const name = filename.join('.')
      const settings = parseOptions(name)
      const input = read(join(__dirname, 'input', filepath), 'utf-8')
      const fixtures = {}
      const possibilities = {}
      let resolved

      Object.keys(all).forEach(source => {
        let treename
        let tree

        treename = [
          filename.join('.'),
          source ? `.${source}` : '',
          '.json',
        ].join('')

        tree = join(__dirname, 'tree', treename)

        if (exists(tree)) {
          fixtures[source] = JSON.parse(read(tree, 'utf-8'))

          possibilities[source] = all[source]
        } else if (
            TYPE === typeMap.true &&
            source in virtual &&
            !settings.output
        ) {
          possibilities[source] = all[source]
        }
      })

      if (!Object.keys(fixtures).length) {
        throw new Error(`Missing fixture for \`${name}\``)
      }

      resolved = resolveFixtures(fixtures, possibilities)

      if (settings.output) {
        if (Object.keys(fixtures).length > 1) {
          throw new Error(
                `Multiple fixtures for output \`${name}\``
            )
        }
      }

      return {
        'input': input,
        'possibilities': possibilities,
        'mapping': resolved,
        'trees': fixtures,
        'stringify': settings.stringify,
        'output': settings.output,
        'size': stat(join(__dirname, 'input', filepath)).size,
        'name': name,
      }
    }
)

export default tests
