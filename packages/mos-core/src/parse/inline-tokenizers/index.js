import escape from './escape'
import autoLink from './auto-link'
import url from './url'
import tag from './tag'
import link from './link'
import reference from './reference'
import strong from './strong'
import emphasis from './emphasis'
import deletion from './deletion'
import inlineCode from './code'
import breakTokenizer from './break'
import text from './text'

export default [
  {
    name: 'escape',
    func: escape,
  },
  {
    name: 'autoLink',
    func: autoLink,
  },
  {
    name: 'url',
    func: url,
  },
  {
    name: 'tag',
    func: tag,
  },
  {
    name: 'link',
    func: link,
  },
  {
    name: 'reference',
    func: reference,
  },
  // shortcutReference?
  {
    name: 'strong',
    func: strong,
  },
  {
    name: 'emphasis',
    func: emphasis,
  },
  {
    name: 'deletion',
    func: deletion,
  },
  {
    name: 'inlineCode',
    func: inlineCode,
  },
  {
    name: 'break',
    func: breakTokenizer,
  },
  {
    name: 'inlineText',
    func: text,
  },
]
