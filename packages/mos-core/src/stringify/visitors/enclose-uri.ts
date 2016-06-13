import ccount from 'ccount'

/*
 * Expressions.
 */

const EXPRESSIONS_WHITE_SPACE = /\s/

export default function encloseURI (uri: string, always?: boolean): string {
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
