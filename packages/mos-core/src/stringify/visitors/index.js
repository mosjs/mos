const visitors = {}

import block from './block'

visitors.block = block

import root from './root'

visitors.root = root

import heading from './heading'

visitors.heading = heading

import text from './text'

visitors.text = text

import paragraph from './paragraph'

visitors.paragraph = paragraph

import blockquote from './blockquote'

visitors.blockquote = blockquote

import list from './list'

visitors.list = list

import inlineCode from './inline-code'

visitors.inlineCode = inlineCode

import yaml from './yaml'

visitors.yaml = yaml

import code from './code'

visitors.code = code

import html from './html'

visitors.html = html

import thematicBreak from './thematic-break'

visitors.thematicBreak = thematicBreak

import strong from './strong'

visitors.strong = strong

import emphasis from './emphasis'

visitors.emphasis = emphasis

import breakVisitor from './break'

visitors.break = breakVisitor

import deleteVisitor from './delete'

visitors.delete = deleteVisitor

import link from './link'

visitors.link = link

import linkReference from './link-reference'

visitors.linkReference = linkReference

import imageReference from './image-reference'

visitors.imageReference = imageReference

import footnoteReference from './footnote-reference'

visitors.footnoteReference = footnoteReference

import definition from './definition'

visitors.definition = definition

import image from './image'

visitors.image = image

import footnote from './footnote'

visitors.footnote = footnote

import footnoteDefinition from './footnote-definition'

visitors.footnoteDefinition = footnoteDefinition

import table from './table'

visitors.table = table

import tableCell from './table-cell'

visitors.tableCell = tableCell

export default visitors
