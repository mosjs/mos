export default entityPrefixLength
import decode from 'parse-entities'

/**
 * Returns the length of HTML entity that is a prefix of
 * the given string (excluding the '&'), 0 if it
 * does not start with an entity.
 *
 * @example
 *   entityPrefixLength('&copycat') // 4
 *   entityPrefixLength('&foo &amp &bar') // 0
 *
 * @param {string} value - Input string.
 * @return {number} - Length of an entity.
 */
function entityPrefixLength (value) {
  let prefix

    /* istanbul ignore if - Currently also tested for at
     * implemention, but we keep it here because that’s
     * proper. */
  if (value.charAt(0) !== '&') {
    return 0
  }

  prefix = value.split('&', 2).join('&')

  return prefix.length - decode(prefix).length
}
