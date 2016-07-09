declare module 'babel-run-async' {
  function runAsync(fn: Function): Function;
  export default runAsync
}

declare module 'mos-read-pkg-up' {
  function sync(path: string): {pkg: Object};
  export default {sync}
}
