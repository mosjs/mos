import eatHTMLComment from '../eat/html-comment'
import eatHTMLCDATA from '../eat/html-cdata'
import eatHTMLProcessingInstruction from '../eat/html-processing-instructions'
import eatHTMLDeclaration from '../eat/html-declaration'
import eatHTMLClosingTag from '../eat/html-closing-tag'
import eatHTMLOpeningTag from '../eat/html-opening-tag'
import Tokenizer from '../tokenizer'

const EXPRESSION_HTML_LINK_OPEN = /^<a /i
const EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i

/**
 * Tokenise an HTML tag.
 *
 * @example
 *   tokenizeTag(eat, '<span foo="bar">')
 *
 * @property {Function} locator - Tag locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `html` node.
 */
const tokenizeTag: Tokenizer = function (parser, value, silent) {
  const subvalue = eatHTMLComment(value, parser.options) ||
    eatHTMLCDATA(value) ||
    eatHTMLProcessingInstruction(value) ||
    eatHTMLDeclaration(value) ||
    eatHTMLClosingTag(value) ||
    eatHTMLOpeningTag(value)

  if (!subvalue) {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  if (!parser.state.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
    parser.state.inLink = true
  } else if (parser.state.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
    parser.state.inLink = false
  }

  return parser.eat(subvalue)({
    type: 'html',
    value: subvalue,
  })
}

/**
 * Find a possible tag.
 *
 * @example
 *   locateTag('foo <bar') // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible tag.
 */
tokenizeTag.locator = function (parser, value, fromIndex) {
  return value.indexOf('<', fromIndex)
}

export default tokenizeTag
