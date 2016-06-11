/*
 * Characters.
 */

const C_FORM_FEED = '\f'
const C_CARRIAGE_RETURN = '\r'
const C_VERTICAL_TAB = '\v'
const C_NO_BREAK_SPACE = '\u00a0'
const C_OGHAM_SPACE = '\u1680'
const C_MONGOLIAN_VOWEL_SEPARATOR = '\u180e'
const C_EN_QUAD = '\u2000'
const C_EM_QUAD = '\u2001'
const C_EN_SPACE = '\u2002'
const C_EM_SPACE = '\u2003'
const C_THREE_PER_EM_SPACE = '\u2004'
const C_FOUR_PER_EM_SPACE = '\u2005'
const C_SIX_PER_EM_SPACE = '\u2006'
const C_FIGURE_SPACE = '\u2007'
const C_PUNCTUATION_SPACE = '\u2008'
const C_THIN_SPACE = '\u2009'
const C_HAIR_SPACE = '\u200a'
const C_LINE_SEPARATOR = '​\u2028'
const C_PARAGRAPH_SEPARATOR = '​\u2029'
const C_NARROW_NO_BREAK_SPACE = '\u202f'
const C_IDEOGRAPHIC_SPACE = '\u3000'
const C_ZERO_WIDTH_NO_BREAK_SPACE = '\ufeff'
/**
 * Check whether `character` is white-space.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is white-space.
 */
function isWhiteSpace (character) {
  return character === ' ' ||
        character === C_FORM_FEED ||
        character === '\n' ||
        character === C_CARRIAGE_RETURN ||
        character === '\t' ||
        character === C_VERTICAL_TAB ||
        character === C_NO_BREAK_SPACE ||
        character === C_OGHAM_SPACE ||
        character === C_MONGOLIAN_VOWEL_SEPARATOR ||
        character === C_EN_QUAD ||
        character === C_EM_QUAD ||
        character === C_EN_SPACE ||
        character === C_EM_SPACE ||
        character === C_THREE_PER_EM_SPACE ||
        character === C_FOUR_PER_EM_SPACE ||
        character === C_SIX_PER_EM_SPACE ||
        character === C_FIGURE_SPACE ||
        character === C_PUNCTUATION_SPACE ||
        character === C_THIN_SPACE ||
        character === C_HAIR_SPACE ||
        character === C_LINE_SEPARATOR ||
        character === C_PARAGRAPH_SEPARATOR ||
        character === C_NARROW_NO_BREAK_SPACE ||
        character === C_IDEOGRAPHIC_SPACE ||
        character === C_ZERO_WIDTH_NO_BREAK_SPACE
}

export default isWhiteSpace
