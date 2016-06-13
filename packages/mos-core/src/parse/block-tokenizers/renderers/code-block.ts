import trimTrailingLines from 'trim-trailing-lines'
import {CodeNode} from '../../../node'

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
export default function renderCodeBlock (value: string, language?: string): CodeNode {
  return {
    type: 'code',
    lang: language || null,
    value: trimTrailingLines(value || ''),
  }
}
