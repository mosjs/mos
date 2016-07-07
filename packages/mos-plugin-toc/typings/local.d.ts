declare module 'markdownscript' {
  import {Node, ListNode, ListItemNode, LinkNode} from 'mos-core';
  type NodeOrString = Node | string
  function paragraph(children: NodeOrString[]): Node;
  function list(attrs: {loose?: boolean, ordered?: boolean}, children?: NodeOrString[]): ListNode;
  function listItem(attrs: {loose: boolean}, children?: NodeOrString[]): ListItemNode;
  function link(attrs: {title: string, url: string}, children?: NodeOrString[]): LinkNode;
  export default {paragraph, list, listItem, link}
}

declare module 'path' {
  function resolve(a: string, b: string): string;
  function join(a: string, b: string): string;
  export default { resolve, join }
}

declare module 'fs' {
  function readFileSync(path: string, encoding: string): string;
  function existsSync(path: string): boolean;
  function readdirSync(path: string): string[];
  export default { readFileSync, existsSync, readdirSync }
}

declare module 'github-slugger' {
  class GithubSlugger {
    constructor()
    slug: (s: string) => string
  }
  export default GithubSlugger
}

declare module 'mos-read-pkg-up' {
  function sync(path: string): {pkg: Object};
  export default {sync}
}
