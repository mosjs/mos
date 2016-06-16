import yamlFrontMatter from './yaml-front-matter'
import newline from './new-line'
import intendedCode from './intended-code'
import fencedCode from './fenced-code'
import blockquote from './blockquote'
import atxHeading from './atx-heading'
import thematicBreak from './thematic-break'
import list from './list'
import setextHeading from './setext-heading'
import html from './html'
import footnote from './footnote'
import definition from './definition'
import table from './table'
import paragraph from './paragraph'
import Tokenizer from '../tokenizer';

export default [
  {
    name: 'yamlFrontMatter',
    func: yamlFrontMatter,
  },
  {
    name: 'newline',
    func: newline,
  },
  {
    name: 'intendedCode',
    func: intendedCode,
  },
  {
    name: 'fencedCode',
    func: fencedCode,
  },
  {
    name: 'blockquote',
    func: blockquote,
  },
  {
    name: 'atxHeading',
    func: atxHeading,
  },
  {
    name: 'thematicBreak',
    func: thematicBreak,
  },
  {
    name: 'list',
    func: list,
  },
  {
    name: 'setextHeading',
    func: setextHeading,
  },
  {
    name: 'html',
    func: html,
  },
  {
    name: 'footnote',
    func: footnote,
  },
  {
    name: 'definition',
    func: definition,
  },
  // looseTable?
  {
    name: 'table',
    func: table,
  },
  {
    name: 'paragraph',
    func: paragraph,
  },
]
