export default encodeFactory
import encode from 'stringify-entities'

/**
 * Encode noop.
 * Simply returns the given value.
 *
 * @example
 *   var encode = encodeNoop();
 *   encode('AT&T') // 'AT&T'
 *
 * @param {string} value - Content.
 * @return {string} - Content, without any modifications.
 */
function encodeNoop (value) {
  return value
}

/**
 * Factory to encode HTML entities.
 * Creates a no-operation function when `type` is
 * `'false'`, a function which encodes using named
 * references when `type` is `'true'`, and a function
 * which encodes using numbered references when `type` is
 * `'numbers'`.
 *
 * @example
 *   encodeFactory('false')('AT&T') // 'AT&T'
 *   encodeFactory('true')('AT&T') // 'AT&amp;T'
 *   encodeFactory('numbers')('AT&T') // 'ATT&#x26;T'
 *
 * @param {string} type - Either `'true'`, `'false'`, or
 *   `'numbers'`.
 * @return {function(string): string} - Function which
 *   takes a value and returns its encoded version.
 */
function encodeFactory (type) {
  const options = {}

  if (type === 'false') {
    return encodeNoop
  }

  if (type === 'true') {
    options.useNamedReferences = true
  }

  if (type === 'escape') {
    options.escapeOnly = options.useNamedReferences = true
  }

    /**
     * Encode HTML entities using the bound options.
     *
     * @example
     *   // When `type` is `'true'`.
     *   encode('AT&T'); // 'AT&amp;T'
     *
     *   // When `type` is `'numbers'`.
     *   encode('AT&T'); // 'ATT&#x26;T'
     *
     * @param {string} value - Content.
     * @param {Object} [node] - Node which is compiled.
     * @return {string} - Encoded content.
     */
  function encoder (value) {
    return encode(value, options)
  }

  return encoder
}
