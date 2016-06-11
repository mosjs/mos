<!--@'# ' + package.name-->
# mos-plugin-snippet
<!--/@-->

<!--@'> ' + package.description-->
> A mos plugin for embedding snippets from files
<!--/@-->

<!--@shields.flatSquare('npm')-->
[![NPM version](https://img.shields.io/npm/v/mos-plugin-snippet.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-snippet)
<!--/@-->

<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install mos-plugin-snippet --save
```
<!--/@-->

## Usage example

In this markdown file there is this template code:

```md
<!--@snippet('./src/test/file-1.js#foo', { showSource: true })-->
<!--/@-->
```

And it is rendered into this snippet:

<!--@snippet('./src/test/file-1.js#foo', { showSource: true })-->
``` js
console.log('foo')
console.log('bar')
```
> Excerpt from [./src/test/file-1.js](./src/test/file-1.js#L8-L9)
<!--/@-->

## API

- `snippet(snippetPath: string)`
- `snippet(snippetPath: string, { showSource: bool })`

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->
