import {Tokenize, Eater} from './tokenize-factory'
import Tokenizer from './tokenizer'
import {Node, Location} from '../node'

export type Processor = {
  blockTokenizers:  Tokenizers,
  inlineTokenizers: Tokenizers,
  data: ParserData,
}

export interface Decoder {
  (value: string, position: Location, handler: Function): void;
  raw(value: string, position: Location): string;
}

export type Tokenizers = {
  name: string,
  func: Tokenizer,
}[]

export type ParserData = {
  escape?: {
    commonmark?: string[],
    gfm?: string[],
    default?: string[],
  },
}

export type ParserOptions = {
  commonmark?: boolean,
  gfm?: boolean,
  default?: boolean,
  footnotes?: boolean,
  pedantic?: boolean,
  yaml?: boolean,
  position?: boolean,
  breaks?: boolean,
}

export type SimpleParser = {
  setOptions(options: ParserOptions): SimpleParser,
  indent(start: number): (offset: number) => void,
  toOffset?: Function,
  offset?: {[line: number]: number},
  context: {
    inLink: boolean,
    atTop: boolean,
    atStart: boolean,
    inBlockquote: boolean,
    inAutoLink: boolean,
  },
  options: ParserOptions,
  escape?: string[],
  blockTokenizers:  Tokenizers,
  inlineTokenizers: Tokenizers,
  eof?: Location,
}

export type Parser = SimpleParser & {
  decode: Decoder,
  descape: Function,
  tokenizeBlock?: Tokenize,
  tokenizeInline?: Tokenize,
  tryTokenizeBlock?: (eat: Eater, tokenizerName: string, subvalue: string, silent: boolean) => Promise<boolean>,
  parse(contents: string, opts?: ParserOptions): Promise<Node>,
}
