<!--@'# ' + pkg.name-->
# mos-plugin-snippet
<!--/@-->

<!--@'> ' + pkg.description-->
> A mos plugin for embedding snippets from files
<!--/@-->

<!--@shields.flatSquare('npm')-->
[![npm version](https://img.shields.io/npm/v/mos-plugin-snippet.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-snippet)
<!--/@-->

## Installation

```sh
npm install --save mos-plugin-snippet
```

## Usage example

In this markdown file there is this template code:

```md
<!--@snippet('./test/fixtures/file-1.js#foo', { showSource: true })-->
<!--/@-->
```

And it is rendered into this snippet:

<!--@snippet('./test/fixtures/file-1.js#foo', { showSource: true })-->
```js
console.log('foo')
console.log('bar')
```

> Excerpt from [./test/fixtures/file-1.js](./test/fixtures/file-1.js#L8-L9)
<!--/@-->

## API

- `snippet(snippetPath: string)`
- `snippet(snippetPath: string, { showSource: bool })`

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
