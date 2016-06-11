import ccount from 'ccount'

/*
 * Expressions.
 */

const EXPRESSIONS_WHITE_SPACE = /\s/

export default function encloseURI (uri, always) {
  if (
    always ||
    !uri.length ||
    EXPRESSIONS_WHITE_SPACE.test(uri) ||
    ccount(uri, '(') !== ccount(uri, ')')
  ) {
    return `<${uri}>`
  }

  return uri
};
