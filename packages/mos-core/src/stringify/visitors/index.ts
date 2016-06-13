import block from './block'
import root from './root'
import heading from './heading'
import text from './text'
import paragraph from './paragraph'
import blockquote from './blockquote'
import list from './list'
import inlineCode from './inline-code'
import yaml from './yaml'
import code from './code'
import html from './html'
import thematicBreak from './thematic-break'
import strong from './strong'
import emphasis from './emphasis'
import breakVisitor from './break'
import deleteVisitor from './delete'
import link from './link'
import linkReference from './link-reference'
import imageReference from './image-reference'
import footnoteReference from './footnote-reference'
import definition from './definition'
import image from './image'
import footnote from './footnote'
import footnoteDefinition from './footnote-definition'
import table from './table'
import tableCell from './table-cell'
import {Node} from '../../node';
import {VisitorsMap} from '../visitor';

const visitors: VisitorsMap = {
  block,
  root,
  heading,
  text,
  paragraph,
  blockquote,
  list,
  inlineCode,
  yaml,
  code,
  html,
  thematicBreak,
  strong,
  emphasis,
  break: breakVisitor,
  delete: deleteVisitor,
  link,
  linkReference,
  imageReference,
  footnoteReference,
  definition,
  image,
  footnote,
  footnoteDefinition,
  table,
  tableCell,
}

export default visitors
