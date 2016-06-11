import nodeTypes from '../../node-types'
import trimTrailingLines from 'trim-trailing-lines'

/**
 * Create a code-block node.
 *
 * @example
 *   renderCodeBlock('foo()', 'js', now());
 *
 * @param {string?} [value] - Code.
 * @param {string?} [language] - Optional language flag.
 * @param {Function} eat - Eater.
 * @return {Object} - `code` node.
 */
export default function renderCodeBlock (value, language) {
  return {
    type: nodeTypes.CODE,
    lang: language || null,
    value: trimTrailingLines(value || ''),
  }
}
