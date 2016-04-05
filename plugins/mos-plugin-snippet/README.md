# mos-plugin-snippet

A mos plugin that allows to embed snippets from files to the markdown


## Usage example

In this markdown file there is this template code:

``` md
<!--@snippet('./lib/test/file-1.js#foo', { showSource: true })-->
<!--/@-->
```

And it is rendered into this snippet:

<!--@snippet('./lib/test/file-1.js#foo', { showSource: true })-->
``` js
console.log('foo')
console.log('bar')
```
> Excerpt from [./lib/test/file-1.js](./lib/test/file-1.js#L8-L9)
<!--/@-->


## API

* `snippet(snippetPath: string)`
* `snippet(snippetPath: string, { showSource: bool })`
