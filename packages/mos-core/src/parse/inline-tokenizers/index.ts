import escape from './escape'
import autoLink from './auto-link'
import url from './url'
import html from './html'
import link from './link'
import reference from './reference'
import strong from './strong'
import emphasis from './emphasis'
import deletion from './deletion'
import code from './code'
import breakTokenizer from './break'
import text from './text'
import Tokenizer from '../tokenizer'

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
    name: 'html',
    func: html,
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
    name: 'code',
    func: code,
  },
  {
    name: 'break',
    func: breakTokenizer,
  },
  {
    name: 'text',
    func: text,
  },
]
