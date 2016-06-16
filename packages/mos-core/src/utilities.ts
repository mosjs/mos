import {Node} from './node'
import collapseWhiteSpace from 'collapse-white-space'

/*
 * Expressions.
 */

const EXPRESSION_LINE_BREAKS = /\r\n|\r/g
const EXPRESSION_SYMBOL_FOR_NEW_LINE = /\u2424/g
const EXPRESSION_BOM = /^\ufeff/

/**
 * Throw an exception with in its `message` `value`
 * and `name`.
 *
 * @param {*} value - Invalid value.
 * @param {string} name - Setting name.
 */
export function raise<T> (value: T, name: string): void {
  throw new Error(
    `Invalid value \`${value}\` for setting \`${name}\``
  )
}

/**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateBoolean({foo: null}, 'foo', true) // true
 *   validateBoolean({foo: false}, 'foo', true) // false
 *   validateBoolean({foo: 'bar'}, 'foo', true) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a boolean.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {boolean} def - Default value.
 */
function validateBoolean (context: Object, name: string, def: boolean): void {
  let value = context[name]

  if (value === null || value === undefined) {
    value = def
  }

  if (typeof value !== 'boolean') {
    raise(value, `options.${name}`)
  }

  context[name] = value
}

/**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateNumber({foo: null}, 'foo', 1) // 1
 *   validateNumber({foo: 2}, 'foo', 1) // 2
 *   validateNumber({foo: 'bar'}, 'foo', 1) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a number.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {number} def - Default value.
 */
function validateNumber (context: Object, name: string, def: number): void {
  let value = context[name]

  if (value === null || value === undefined) {
    value = def
  }

  if (typeof value !== 'number' || value !== value) { // eslint-disable-line no-self-compare
    raise(value, `options.${name}`)
  }

  context[name] = value
}

/**
 * Validate a value to be in `map`. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * not in `map`.
 *
 * @example
 *   var map = {bar: true, baz: true};
 *   validateString({foo: null}, 'foo', 'bar', map) // 'bar'
 *   validateString({foo: 'baz'}, 'foo', 'bar', map) // 'baz'
 *   validateString({foo: true}, 'foo', 'bar', map) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   in `map`.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {string} def - Default value.
 * @param {Object} map - Enum.
 */
function validateString (context: Object, name: string, def: string, map: Object): void {
  let value = context[name]

  if (value === null || value === undefined) {
    value = def
  }

  if (!(value in map)) {
    raise(value, `options.${name}`)
  }

  context[name] = value
}

/**
 * Clean a string in preperation of parsing.
 *
 * @example
 *   clean('\ufefffoo'); // 'foo'
 *   clean('foo\r\nbar'); // 'foo\nbar'
 *   clean('foo\u2424bar'); // 'foo\nbar'
 *
 * @param {string} value - Content to clean.
 * @return {string} - Cleaned content.
 */
export function clean (value: string): string {
  return String(value)
        .replace(EXPRESSION_BOM, '')
        .replace(EXPRESSION_LINE_BREAKS, '\n')
        .replace(EXPRESSION_SYMBOL_FOR_NEW_LINE, '\n')
}

/**
 * Normalize an identifier.  Collapses multiple white space
 * characters into a single space, and removes casing.
 *
 * @example
 *   normalizeIdentifier('FOO\t bar'); // 'foo bar'
 *
 * @param {string} value - Content to normalize.
 * @return {string} - Normalized content.
 */
export function normalizeIdentifier (value: string): string {
  return collapseWhiteSpace(value).toLowerCase()
}

/**
 * Check whether a node is mergeable with adjacent nodes.
 *
 * @param {Object} node - Node to check.
 * @return {boolean} - Whether `node` is mergable.
 */
export function mergeable (node: Node): boolean {
  if (node.type !== 'text' || !node.position) {
    return true
  }

  const start = node.position.start
  const end = node.position.end

  /*
   * Only merge nodes which occupy the same size as their
   * `value`.
   */

  return start.line !== end.line ||
        end.column - start.column === node.value.length
}

export const validate = {
  boolean: validateBoolean,
  string: validateString,
  number: validateNumber,
}
