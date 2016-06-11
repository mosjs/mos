import yamlFrontMatter from './yaml-front-matter'
import newline from './new-line'
import code from './code'
import fences from './fences'
import blockquote from './blockquote'
import heading from './heading'
import thematicBreak from './thematic-break'
import list from './list'
import lineHeading from './line-heading'
import html from './html'
import footnoteDefinition from './footnote'
import definition from './definition'
import table from './table'
import paragraph from './paragraph'

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
    name: 'code',
    func: code,
  },
  {
    name: 'fences',
    func: fences,
  },
  {
    name: 'blockquote',
    func: blockquote,
  },
  {
    name: 'heading',
    func: heading,
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
    name: 'lineHeading',
    func: lineHeading,
  },
  {
    name: 'html',
    func: html,
  },
  {
    name: 'footnoteDefinition',
    func: footnoteDefinition,
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
