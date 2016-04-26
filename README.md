<!--#preview-->
<!--@'# ' + package.name-->
# mos
<!--/@-->

<!--@'> ' + package.description-->
> A pluggable module that injects content into your markdown files via hidden JavaScript snippets
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos)
[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/mos)
[![Test coverage for master](https://img.shields.io/coveralls/zkochan/mos/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos?branch=master)
<!--/@-->

<!--#-->

## Why mos?

- Markdown files are always up to date
- [Examples are always correct][mos-plugin-example]
- [Shields (a.k.a. badges) are auto-generated][mos-plugin-shields]
- Commonly used README sections are auto-generated using info from `package.json`
- Plugins can be used for tons of additional features

## Preview

The [readme][] you are currently reading uses mos!

<!--@snippet('README.md#preview')-->
``` md
<!--@'# ' + package.name-->
# mos
<!--/@-->

<!--@'> ' + package.description-->
> A pluggable module that injects content into your markdown files via hidden JavaScript snippets
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos)
[![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/mos)
[![Test coverage for master](https://img.shields.io/coveralls/zkochan/mos/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos?branch=master)
<!--/@-->
```
<!--/@-->

<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install mos --save
```
<!--/@-->

## Usage

Mos uses a simple templating syntax to execute JavaScript inside markdown files. The result of the JavaScript execution is then inserted into the markdown file.

The great thing is, that the template and the markdown file are actually the same file! The code snippets are written inside markdown comments, which are invisible when reading the generated markdown file.

Lets use mos to write a readme with some dynamic data. Have you ever renamed your package and forgotten to update the readme? Good news! With mos it won't ever happen again:

**README.md**

```md
<!--@'# ' + package.name-->
<!--/@-->
```

If you view your readme now, it will be empty. However, you have the code that can insert the title in your readme. All you have to do now is to run `mos` in a terminal.

Once you've ran `mos`, the readme will look like this:

```md
<!--@'# ' + package.name-->
# my-awesome-module
<!--/@-->
```

Now your readme has both the code that generates the content and the content itself. However, only the content is visible after the readme is generated to HTML by GitHub or npm. Awesome!

![Happy cat](http://i.imgur.com/JG9BXxe.jpg)

## CLI Usage

### `mos`

Regenerate the markdown files if they are out of date.

### `mos test`

Test the markdown files. Fails if can't generate one of the markdown files or one of the markdown files is out of date. It is recommended to add this command to the `scripts.test` property of `package.json`.

![](http://i.imgur.com/t6CLmMS.png?1)

#### Optional TAP output

Mos can generate TAP output via `--tap` option for use with any [TAP reporter](https://github.com/sindresorhus/awesome-tap#reporters).

```console
mos test --tap | tap-nyan
```

![](http://i.imgur.com/jet4ZAG.png?2)

## API Usage

```js
const mos = require('mos')

const processor = mos()
  .use(require('mos-plugin-scripts')) // use mos plugins
  .useRemarkPlugin(require('remark-word-wrap')) // use remark plugins

processor.process('# Header', { filePath: '/home/src/README.md' })
  .then(newmd => console.log(newmd))
```

## Mos plugins

In the usage example the `package` variable was used to access the package info. The variables available in the markdown scope are _declared by mos plugins_. The `package` variable is created by the [package-json](./plugins/package-json) plugin.

There are a few mos plugins that are installed with mos by default:

- [package-json](./plugins/mos-plugin-package-json)
- [shields][mos-plugin-shields]
- [license](./plugins/mos-plugin-license)
- [installation](./plugins/mos-plugin-installation)
- [example][mos-plugin-example]
- [dependencies](https://github.com/zkochan/mos-plugin-dependencies)
- [snippet](https://github.com/zkochan/mos-plugin-snippet)

Do you want to write a new one? Read the [plugins readme](./plugins/README.md).

## Remark plugins

Mos uses [remark](https://github.com/wooorm/remark) under the hood and as a consequence, can use remark plugins for processing the markdown files.

These are the remark plugins installed with mos by default:

- [remark-toc](https://github.com/wooorm/remark-toc)

It is possible to extend mos with additional remark plugins, by registering them through a `mosfile.js`.

Lets suppose we want to use [remark-word-wrap](https://www.npmjs.com/package/remark-word-wrap) to wrap the lines of markdown files to a specified width. We can install this remark plugin as a dev dependency and create a `mosfile` in the root directory of the package.

```js
const wordWrap = require('remark-word-wrap')

module.exports = function (mos) {
  mos.useRemarkPlugin(wordWrap, { width: 80 })
}
```

Next time mos will be run, the markdown files will be processed by the remark plugins registered via mosfile (in this case by remark-word-wrap).

## Who uses mos?

- [magic-hook](https://github.com/zkochan/magic-hook)

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## Dependencies [![Dependency status for master](https://img.shields.io/david/zkochan/mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/mos/master)

- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
- [file-exists](https://github.com/scottcorgan/file-exists): Check if filepath exists and is a file
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [glob](https://github.com/isaacs/node-glob): a little globber
- [meow](https://github.com/sindresorhus/meow): CLI app helper
- [mos-plugin-dependencies](https://github.com/zkochan/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-example](https://github.com/zkochan/mos-plugin-example): A mos plugin that combines example code files with their output
- [mos-plugin-shields](https://github.com/zkochan/mos-plugin-shields): A mos plugin for creating markdown shields
- [mos-plugin-snippet](https://github.com/zkochan/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [normalize-newline](https://github.com/sindresorhus/normalize-newline): Normalize the newline characters in a string to `\n`
- [normalize-path](https://github.com/jonschlinkert/normalize-path): Normalize file path slashes to be unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes.
- [read-pkg-up](https://github.com/sindresorhus/read-pkg-up): Read the closest package.json file
- [relative](https://github.com/jonschlinkert/relative): Get the relative filepath from path A to path B. Calculates from file-to-directory, file-to-file, directory-to-file, and directory-to-directory.
- [remark](https://github.com/wooorm/remark): Markdown processor powered by plugins
- [remark-mos](https://github.com/zkochan/remark-mos): Inject parts of markdown via hidden JavaScript snippets
- [remark-toc](https://github.com/wooorm/remark-toc): Generate a Table of Contents (TOC) for Markdown files
- [resolve](https://github.com/substack/node-resolve): resolve like require.resolve() on behalf of files asynchronously and synchronously
- [run-async](https://github.com/sboudrias/run-async): Utility method to run function either synchronously or asynchronously using the common `this.async()` style.
- [tap-diff](https://github.com/axross/tap-diff): The most human-friendly TAP reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## Dev Dependencies [![devDependency status for master](https://img.shields.io/david/dev/zkochan/mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/mos/master#info=devDependencies)

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [execa](https://github.com/sindresorhus/execa): A better `child_process`
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->

* * *

**What does mos mean?**
<br>
It means _Markdown on Steroids_!

[readme]: https://raw.githubusercontent.com/zkochan/mos/master/README.md

[mos-plugin-example]: https://github.com/zkochan/mos-plugin-example

[mos-plugin-shields]: https://github.com/zkochan/mos-plugin-shields
