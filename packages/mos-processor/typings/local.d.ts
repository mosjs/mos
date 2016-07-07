declare function readPkgUp(opts: {cwd?: string}): Promise<{
  path: string,
  pkg: any,
  repo: {user: string, repo: string},
}>;

declare module 'mos-read-pkg-up' {
  export default readPkgUp
}

declare function githubUrlToObject(path: string): any;

declare module 'github-url-to-object' {
  export default githubUrlToObject
}

declare module 'path' {
  function dirname(path: string): string;
  function resolve(...part: string[]): string;
  export default {dirname, resolve}
}

declare function remiRunner(): () => void

declare module 'remi-runner' {
  export default remiRunner
}

declare module 'plugiator' {
  import {Plugin} from 'remi'
  function anonymous(fn: Function): Plugin;
  export {anonymous}
}
