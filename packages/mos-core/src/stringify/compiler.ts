import {Node} from '../node'

export type CompilerOptions = {
  gfm?: boolean,
  commonmark?: boolean,
  pedantic?: boolean,
  entities?: string,
  setext?: boolean,
  closeAtx?: boolean,
  looseTable?: boolean,
  spacedTable?: boolean,
  incrementListMarker?: boolean,
  fences?: boolean,
  fence?: string,
  bullet?: string,
  listItemIndent?: string,
  rule?: string,
  ruleSpaces?: boolean,
  ruleRepetition?: number,
  strong?: string,
  emphasis?: string,
}

export type CompilerContext = {
  inShortcutReference: boolean,
  inCollapsedReference: boolean,
  inLink: boolean,
  inTable: boolean,
}

export type Compiler = {
  options: CompilerOptions,
  setOptions: Function,
  context: CompilerContext,
  visit(node: Node, parent?: Node): string,
  all(parent: Node): string[],
  compile(tree: Node, opts: CompilerOptions): string,
  encode?: Function,
  escape?: Function,
}
