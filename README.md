<!--#preview-->
<!--@h1([pkg.name])-->
# mos
<!--/@-->

<!--@blockquote([pkg.description])-->
> A pluggable module that injects content into your markdown files via hidden JavaScript snippets
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos) [![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/mos) [![Test coverage for master](https://img.shields.io/coveralls/zkochan/mos/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos?branch=master)
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
```md
<!--@h1([pkg.name])-->
# mos
<!--/@-->

<!--@blockquote([pkg.description])-->
> A pluggable module that injects content into your markdown files via hidden JavaScript snippets
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos) [![Build status for master](https://img.shields.io/travis/zkochan/mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/mos) [![Test coverage for master](https://img.shields.io/coveralls/zkochan/mos/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos?branch=master)
<!--/@-->
```
<!--/@-->

## Table of Contents

- [Installation](#installation)
  - [Manual installation](#manual-installation)
- [Usage](#usage)
- [CLI Usage](#cli-usage)
  - [mos](#mos)
  - [mos test](#mos-test)
    - [Optional TAP output](#optional-tap-output)
- [API Usage](#api-usage)
- [Mos plugins](#mos-plugins)
- [Who uses mos?](#who-uses-mos)
- [License](#license)
- [Dependencies](#dependencies)
- [Dev Dependencies](#dev-dependencies)

## Installation

Install mos globally:

```sh
npm i -g mos
```

Make mos configure your `package.json`:

```sh
mos --init
```

Your package.json will be update with some new dependencies and script properties:

```json
{
  "name": "awesome-package",
  "scripts": {
    "test": "mos test",
    "md": "mos",
    "?md": "echo \"Update the markdown files\""
  },
  "devDependencies": {
    "mos": "^0.17.0"
  }
}
```

### Manual installation

You can also install mos directly:

```sh
npm i -D mos
```

You'll have to configure the `script` property in your `package.json` to use mos (see above).

## Usage

Mos uses a simple templating syntax to execute JavaScript inside markdown files. The result of the JavaScript execution is then inserted into the markdown file.

The great thing is, that the template and the markdown file are actually the same file! The code snippets are written inside markdown comments, which are invisible when reading the generated markdown file.

Lets use mos to write a readme with some dynamic data. Have you ever renamed your package and forgotten to update the readme? Good news! With mos it won't ever happen again:

**README.md**

```md
<!--@h1([pkg.name])-->
<!--/@-->
```

If you view your readme now, it will be empty. However, you have the code that can insert the title in your readme. All you have to do now is to run `mos` in a terminal.

Once you've run `mos`, the readme will look like this:

```md
<!--@h1([pkg.name])-->
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

<!--@example('example.js')-->
Require the package

```js
const mos = require('mos')
```

Create a processor and use some mos plugins

```js
const processor = mos().use(require('mos-plugin-scripts'))
```

Process raw markdown

```js
processor.process('# Header', { filePath: 'README.md' })
  .then(newmd => console.log(newmd))
  //> # Header
```

Process a markdown AST

```js
const m = require('markdownscript')
const h1 = m.h1
const p = m.paragraph
const ast = m.root([
  h1(['Foo']),
  p(['Bar qar qax']),
])
processor.process(ast, { filePath: 'README.md' })
  .then(newmd => console.log(newmd))
  //> # Foo
  //  
  //  Bar qar qax
```
<!--/@-->

## Mos plugins

In the usage example the `package` variable was used to access the package info. The variables available in the markdown scope are _declared by mos plugins_. The `package` variable is created by the [package-json][mos-plugin-package-json] plugin.

There are a few mos plugins that are installed with mos by default:

- [package-json][mos-plugin-package-json]
- [shields][mos-plugin-shields]
- [license](https://github.com/zkochan/mos-plugin-license)
- [installation](https://github.com/zkochan/mos-plugin-installation)
- [example][mos-plugin-example]
- [dependencies](https://github.com/zkochan/mos-plugin-dependencies)
- [snippet](https://github.com/zkochan/mos-plugin-snippet)
- [table-of-contents](https://github.com/zkochan/remark-toc)
- [markdownscript](https://github.com/zkochan/mos-plugin-markdownscript)

Do you want to write a new one? Read the [plugins readme](./docs/PLUGINS.md).

## Who uses mos?

- [npm-scripts-info](https://github.com/srph/npm-scripts-info)
- [magic-hook](https://github.com/zkochan/magic-hook)

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## <a name="dependencies">Dependencies</a> [![Dependency status for master](https://img.shields.io/david/zkochan/mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/mos/master)

- [@zkochan/read-pkg-up](https://github.com/zkochan/read-pkg-up): Read the closest package.json file
- [@zkochan/remark](https://github.com/wooorm/remark): Markdown processor powered by plugins
- [@zkochan/remark-toc](https://github.com/wooorm/remark-toc): Generate a Table of Contents (TOC) for Markdown files
- [@zkochan/tap-diff](https://github.com/zkochan/tap-diff): The most human-friendly TAP reporter
- [async-unist-util-visit](https://github.com/wooorm/unist-util-visit): Recursively walk over unist nodes
- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
- [file-exists](https://github.com/scottcorgan/file-exists): Check if filepath exists and is a file
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [glob](https://github.com/isaacs/node-glob): a little globber
- [meow](https://github.com/sindresorhus/meow): CLI app helper
- [mos-init](https://github.com/zkochan/mos-init): Add mos to your project
- [mos-plugin-dependencies](https://github.com/zkochan/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-example](https://github.com/zkochan/mos-plugin-example): A mos plugin that combines example code files with their output
- [mos-plugin-installation](https://github.com/zkochan/mos-plugin-installation): A mos plugin for creating installation section
- [mos-plugin-license](https://github.com/zkochan/mos-plugin-license): A mos plugin for generating a license section
- [mos-plugin-markdownscript](https://github.com/zkochan/mos-plugin-markdownscript): A [mos](https://github.com/zkochan/mos) plugin that adds markownscript helpers to the markdown scope
- [mos-plugin-package-json](https://github.com/zkochan/mos-plugin-package-json): A mos plugin that makes the package.json available in the markdown scope
- [mos-plugin-shields](https://github.com/zkochan/mos-plugin-shields): A mos plugin for creating markdown shields
- [mos-plugin-snippet](https://github.com/zkochan/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [normalize-newline](https://github.com/sindresorhus/normalize-newline): Normalize the newline characters in a string to `\n`
- [normalize-path](https://github.com/jonschlinkert/normalize-path): Normalize file path slashes to be unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes.
- [relative](https://github.com/jonschlinkert/relative): Get the relative filepath from path A to path B. Calculates from file-to-directory, file-to-file, directory-to-file, and directory-to-directory.
- [remark-mos](https://github.com/zkochan/remark-mos): Inject parts of markdown via hidden JavaScript snippets
- [reserved-words](https://github.com/zxqfox/reserved-words): ECMAScript reserved words checker
- [resolve](https://github.com/substack/node-resolve): resolve like require.resolve() on behalf of files asynchronously and synchronously
- [run-async](https://github.com/sboudrias/run-async): Utility method to run function either synchronously or asynchronously using the common `this.async()` style.
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## <a name="dev-dependencies">Dev Dependencies</a> [![devDependency status for master](https://img.shields.io/david/dev/zkochan/mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/mos/master#info=devDependencies)

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [execa](https://github.com/sindresorhus/execa): A better `child_process`
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [markdownscript](https://github.com/zkochan/markdownscript): Creates markdown Abstract Syntax Tree
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos-plugin-scripts](https://github.com/zkochan/mos-plugin-scripts): A mos plugin that generates a section with npm scripts descriptions
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->

* * *

**What does mos mean?**
<br>
It means _Markdown on Steroids_!

[readme]: https://raw.githubusercontent.com/zkochan/mos/master/README.md

[mos-plugin-package-json]: https://github.com/zkochan/mos-plugin-package-json

[mos-plugin-example]: https://github.com/zkochan/mos-plugin-example

[mos-plugin-shields]: https://github.com/zkochan/mos-plugin-shields
