<!--@'# ' + package.name-->
# mos-plugin-example
<!--/@-->

<!--@'> ' + package.description-->
> A mos plugin that combines example code files with their output
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos-plugin-example.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-example)
[![Build status for master](https://img.shields.io/travis/mosjs/mos-plugin-example/master.svg?style=flat-square)](https://travis-ci.org/mosjs/mos-plugin-example)
[![Test coverage for master](https://img.shields.io/coveralls/mosjs/mos-plugin-example/master.svg?style=flat-square)](https://coveralls.io/r/mosjs/mos-plugin-example?branch=master)
<!--/@-->

<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install mos-plugin-example --save
```
<!--/@-->

## Usage

There is an [example/index.js](./example/index.js) file in this module. Its content is:

```js
'use strict'
console.log('Hello world!')

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))

//! Comments that start with an exclamation will be inserted into the markdown outside the code block.

function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
  }
}

printEachLetter('Hello world!')
```

We can load this file via the example plugin. The mos plugin will execute the code in the file and combine the output of the `console.log`s with the code.

In the current `README.md` we have this code snippet:

```md
<!--@example('./example/index.js')-->
<!--/@-->
```

It produces this code block, with the outputs written under the `console.log`s inside comments:

<!--@example('./example/index.js')-->
``` js
'use strict'
console.log('Hello world!')
//> Hello world!

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))
//> 3
```

Comments that start with an exclamation will be inserted into the markdown outside the code block.

``` js
function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
    //> H
    //> e
    //> l
    //> l
    //> o
    //>  
    //> w
    //> o
    //> r
    //> l
    //> d
    //> !
  }
}

printEachLetter('Hello world!')
```
<!--/@-->

## ES6

example/ can be written in ES6, but they have to be loaded with `example.es6`.

Mos uses [rollup](http://rollupjs.org) and [babel](babeljs.io) to transpile the example written ES6.
However, babel is not installed with mos, so you'll have to install babel manually. Put a `.babelrc` file in
your example folder and configure babel the way it is described [here](https://github.com/rollup/rollup-plugin-babel/tree/v2.4.0#configuring-babel).

Here is an example that is using ES6 in the current package:

<!--@example.es6('./example/es6.js')-->
``` js
const sum = (a, b) => a + b

const numbers = [1, 2]
console.log(sum(...numbers))
//> 3
```
<!--/@-->

## API

- `example(relativePathToFile)`
- `example.es6(relativePathToFile)` - process an example written in ES6

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## Dependencies [![Dependency status for master](https://img.shields.io/david/mosjs/mos-plugin-example/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-plugin-example/master)

- [babel-runtime](https://github.com/babel/babel/blob/master/packages): babel selfContained runtime
- [codemo](https://github.com/zkochan/codemo): Embeds console output to the code
- [independent](https://github.com/zkochan/independent): Change relative requires to import actual modules

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## Dev Dependencies [![devDependency status for master](https://img.shields.io/david/dev/mosjs/mos-plugin-example/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-plugin-example/master#info=devDependencies)

- [babel-cli](https://github.com/babel/babel/blob/master/packages): Babel command line.
- [babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports): Fix babel/babel#2212
- [babel-plugin-transform-runtime](https://github.com/babel/babel/blob/master/packages): Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals
- [babel-preset-es2015](https://github.com/babel/babel/blob/master/packages): Babel preset for all es2015 plugins.
- [babel-register](https://github.com/babel/babel/blob/master/packages): babel require hook
- [babel-preset-es2015-rollup](https://npmjs.org/package/babel-preset-es2015-rollup): This is [babel-preset-es2015](http://babeljs.io/docs/plugins/preset-es2015/), minus [modules-commonjs](http://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/), plus [external-helpers](http://babeljs.io/docs/plugins/external-helpers/). Use it wi
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos](https://github.com/zkochan/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->
