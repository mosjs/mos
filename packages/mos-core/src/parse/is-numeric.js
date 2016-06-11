export default isNumeric

const CC_0 = '0'.charCodeAt(0)
const CC_9 = '9'.charCodeAt(0)

/**
 * Check whether `character` is numeric.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is numeric.
 */
function isNumeric (character) {
  const code = character.charCodeAt(0)

  return code >= CC_0 && code <= CC_9
}
