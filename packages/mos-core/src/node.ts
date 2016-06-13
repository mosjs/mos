export type Location = {
  line: number,
  column: number,
  offset: number,
}

export type Position = {
  start: Location,
  end: Location,
  indent?: number[],
}

export type NodeType = 'thematicBreak'
  | 'html'
  | 'yaml'
  | 'table'
  | 'tableCell'
  | 'tableRow'
  | 'paragraph'
  | 'text'
  | 'code'
  | 'list'
  | 'listItem'
  | 'definition'
  | 'footnoteDefinition'
  | 'heading'
  | 'blockquote'
  | 'link'
  | 'image'
  | 'footnote'
  | 'strong'
  | 'emphasis'
  | 'delete'
  | 'inlineCode'
  | 'break'
  | 'root'

export type Node = {
  type: NodeType,
  position?: Position,
  value?: string,
  children?: Node[],
}

export type TableAlign = 'left' | 'center' | 'right'

export type TableNode = Node & {
  align: Array<TableAlign>,
}

export type DefinitionNode = Node & {
  url: string,
  identifier: string,
  title?: string,
}

export type ReferenceNode = Node & {
  referenceType?: 'shortcut' | 'collapsed' | 'full',
  identifier?: string,
}

export type LinkNode = ReferenceNode & {
  title?: string,
  url: string,
}

export type ImageNode = LinkNode & {
  alt?: string,
}

export type CodeNode = Node & {
  lang?: string,
}

export type HeadingNode = Node & {
  depth: number,
}

export type ListNode = Node & {
  ordered: boolean,
  start?: number,
  loose: boolean,
}

export type ListItemNode = Node & {
  checked?: boolean,
  loose: boolean,
}
