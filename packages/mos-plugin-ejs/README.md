<!--@'# ' + pkg.name-->
# mos-plugin-ejs
<!--/@-->

<!--@'> ' + pkg.description-->
> A mos plugin that executes embedded js in markdown files
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos-plugin-ejs.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-ejs) [![Build status for master](https://img.shields.io/travis/mosjs/mos-plugin-ejs/master.svg?style=flat-square)](https://travis-ci.org/mosjs/mos-plugin-ejs) [![Test coverage for master](https://img.shields.io/coveralls/mosjs/mos-plugin-ejs/master.svg?style=flat-square)](https://coveralls.io/r/mosjs/mos-plugin-ejs?branch=master)
<!--/@-->

<!--@installation()-->
## Installation

```sh
npm install --save mos-plugin-ejs
```
<!--/@-->

## Usage

<!--@example('./example.js')-->
```js
'use strict'
const ejs = require('mos-plugin-ejs')
```
<!--/@-->

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## <a name="dependencies">Dependencies</a> [![Dependency status for master](https://img.shields.io/david/mosjs/mos-plugin-ejs/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-plugin-ejs/master)

- [@zkochan/read-pkg-up](https://github.com/zkochan/read-pkg-up): Read the closest package.json file
- [babel-run-async](https://github.com/zkochan/run-async): Utility method to run function either synchronously or asynchronously using the common `this.async()` style.
- [babel-runtime](https://github.com/babel/babel/blob/master/packages): babel selfContained runtime
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [reserved-words](https://github.com/zxqfox/reserved-words): ECMAScript reserved words checker

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## <a name="dev-dependencies">Dev Dependencies</a> [![devDependency status for master](https://img.shields.io/david/dev/mosjs/mos-plugin-ejs/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-plugin-ejs/master#info=devDependencies)

- [babel-cli](https://github.com/babel/babel/blob/master/packages): Babel command line.
- [babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports): Fix babel/babel#2212
- [babel-plugin-transform-runtime](https://github.com/babel/babel/blob/master/packages): Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals
- [babel-preset-es2015](https://github.com/babel/babel/blob/master/packages): Babel preset for all es2015 plugins.
- [babel-register](https://github.com/babel/babel/blob/master/packages): babel require hook
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
- [mos-processor](https://github.com/mosjs/mos-processor): A markdown processor for mos
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [tonic-example](https://github.com/zkochan/tonic-example): Tonic example generator
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->
