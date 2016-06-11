<!--@h1([pkg.name])-->
# mos-init
<!--/@-->

Add [mos](https://github.com/mosjs/mos) to your project

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos-init.svg?style=flat-square)](https://www.npmjs.com/package/mos-init) [![Build status for master](https://img.shields.io/travis/mosjs/mos-init/master.svg?style=flat-square)](https://travis-ci.org/mosjs/mos-init) [![Test coverage for master](https://img.shields.io/coveralls/mosjs/mos-init/master.svg?style=flat-square)](https://coveralls.io/r/mosjs/mos-init?branch=master)
<!--/@-->

<!--@installation()-->
## Installation

```sh
npm install --save mos-init
```
<!--/@-->

## Usage

```js
const mosInit = require('mos-init')
```

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## <a name="dependencies">Dependencies</a> [![Dependency status for master](https://img.shields.io/david/mosjs/mos-init/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-init/master)

- [arr-exclude](https://github.com/sindresorhus/arr-exclude): Exclude certain items from an array
- [core-js](https://github.com/zloirock/core-js): Standard library
- [the-argv](https://github.com/joakimbeng/the-argv): The part of argv you want
- [write-pkg](https://github.com/sindresorhus/write-pkg): Write a package.json file

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## <a name="dev-dependencies">Dev Dependencies</a> [![devDependency status for master](https://img.shields.io/david/dev/mosjs/mos-init/master.svg?style=flat-square)](https://david-dm.org/mosjs/mos-init/master#info=devDependencies)

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [dot-prop](https://github.com/sindresorhus/dot-prop): Get, set, or delete a property from a nested object using a dot path
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos](https://github.com/zkochan/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [temp-write](https://github.com/sindresorhus/temp-write): Write string/buffer to a random temp file
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->

_Inspired by [ava-init](https://github.com/sindresorhus/ava-init)_
