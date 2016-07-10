declare module 'path' {
  function resolve(a: string, b: string): string;
  function dirname(a: string): string;
  function extname(a: string): string;
  function join(a: string, b: string): string;
  export default { resolve, join, dirname, extname }
}

declare module 'fs' {
  function readFileSync(path: string, encoding: string): string;
  function readFile(path: string, encoding: string, cb: (err: Error, content: string) => void): void;
  function existsSync(path: string): boolean;
  function readdirSync(path: string): string[];
  export default { readFileSync, existsSync, readdirSync, readFile }
}

declare module 'mos-read-pkg-up' {
  function sync(path: string): {pkg: Object};
  export default {sync}
}
