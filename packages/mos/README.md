# mos

> A pluggable module that injects content into your markdown files via hidden JavaScript snippets

<!--@shields('npm', 'travis', 'coveralls', 'gitter')-->
[![npm version](https://img.shields.io/npm/v/mos.svg)](https://www.npmjs.com/package/mos) [![Build Status](https://img.shields.io/travis/mosjs/mos/master.svg)](https://travis-ci.org/mosjs/mos) [![Coverage Status](https://img.shields.io/coveralls/mosjs/mos/master.svg)](https://coveralls.io/r/mosjs/mos?branch=master) [![Gitter](https://img.shields.io/gitter/room/mosjs/mos.svg)](https://gitter.im/mosjs/mos)
<!--/@-->

## Why mos?

- Markdown files are always up to date
- [Examples are always correct][mos-plugin-example]
- [Shields (a.k.a. badges) are auto-generated][mos-plugin-shields]
- Commonly used README sections are auto-generated using info from `package.json`
- Plugins can be used for tons of additional features

## Preview

The [readme][] you are currently reading uses mos! Here's how the shields are generated:

```md
<!--@shields('npm', 'travis', 'coveralls', 'gitter')-->
[![npm version](https://img.shields.io/npm/v/mos.svg)](https://www.npmjs.com/package/mos) [![Build Status](https://img.shields.io/travis/mosjs/mos/master.svg)](https://travis-ci.org/mosjs/mos) [![Coverage Status](https://img.shields.io/coveralls/mosjs/mos/master.svg)](https://coveralls.io/r/mosjs/mos?branch=master) [![Gitter](https://img.shields.io/gitter/room/mosjs/mos.svg)](https://gitter.im/mosjs/mos)
<!--/@-->
```

## Table of Contents

- [Installation](#installation)
  - [Manual installation](#manual-installation)
- [Usage](#usage)
- [CLI Usage](#cli-usage)
  - [mos](#mos)
  - [mos test](#mos-test)
    - [Optional TAP output](#optional-tap-output)
- [Mos plugins](#mos-plugins)
  - [Configuring the default plugins](#configuring-the-default-plugins)
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

Your `package.json` will be updated with some new dependencies and `script` properties:

```json
{
  "name": "awesome-package",
  "scripts": {
    "test": "mos test",
    "md": "mos",
    "?md": "echo \"Update the markdown files\""
  },
  "devDependencies": {
    "mos": "^1.2.0"
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

**NOTE:** the CLI will use your local install of mos when available, even when run globally.

## Mos plugins

In the usage example the `package` variable was used to access the package info. The variables available in the markdown scope are _declared by mos plugins_. The `package` variable is created by the [package-json][mos-plugin-package-json] plugin.

There are a few mos plugins that are installed with mos by default:

- [package-json][mos-plugin-package-json]
- [shields][mos-plugin-shields]
- [license](https://github.com/mosjs/mos-plugin-license)
- [installation](https://github.com/mosjs/mos-plugin-installation)
- [example][mos-plugin-example]
- [dependencies](https://github.com/mosjs/mos-plugin-dependencies)
- [snippet](https://github.com/mosjs/mos-plugin-snippet)
- [table-of-contents](https://github.com/mosjs/mos-plugin-toc)
- [markdownscript](https://github.com/mosjs/mos-plugin-markdownscript)

Do you want to write a new one? Read the [plugins readme](./docs/PLUGINS.md).

### Configuring the default plugins

It is possible to pass options to the default mos plugins via the `mos` property in the `package.json`.

```json
{
  "mos": {
    "installation": {
      "useShortAlias": true
    }
  }
}
```

To disable a default plugin, pass `false` instead of a config object:

```json
{
  "mos": {
    "license": false
  }
}
```

## Who uses mos?

- [npm-scripts-info](https://github.com/srph/npm-scripts-info)
- [magic-hook](https://github.com/zkochan/magic-hook)

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)

* * *

<!--@dependencies({ shield: true })-->
## <a name="dependencies">Dependencies</a> [![dependency status](https://img.shields.io/david/mosjs/mos/master.svg)](https://david-dm.org/mosjs/mos/master)

- [@zkochan/read-pkg-up](https://github.com/zkochan/read-pkg-up): Read the closest package.json file
- [@zkochan/tap-diff](https://github.com/zkochan/tap-diff): The most human-friendly TAP reporter
- [babel-runtime](https://github.com/babel/babel/blob/master/packages): babel selfContained runtime
- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
- [glob](https://github.com/isaacs/node-glob): a little globber
- [loud-rejection](https://github.com/sindresorhus/loud-rejection): Make unhandled promise rejections fail loudly instead of the default silent fail
- [magic-hook](https://github.com/zkochan/magic-hook): Extends functions with pre hooks.
- [meow](https://github.com/sindresorhus/meow): CLI app helper
- [mos-init](https://github.com/mosjs/mos-init): Add mos to your project
- [mos-plugin-dependencies](https://github.com/mosjs/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-ejs](https://github.com/mosjs/mos-plugin-ejs): A mos plugin that executes embedded js in markdown files
- [mos-plugin-example](https://github.com/mosjs/mos-plugin-example): A mos plugin that combines example code files with their output
- [mos-plugin-installation](https://github.com/mosjs/mos-plugin-installation): A mos plugin for creating installation section
- [mos-plugin-license](https://github.com/mosjs/mos-plugin-license): A mos plugin for generating a license section
- [mos-plugin-markdownscript](https://github.com/mosjs/mos-plugin-markdownscript): A [mos](https://github.com/mosjs/mos) plugin that adds markownscript helpers to the markdown scope
- [mos-plugin-package-json](https://github.com/mosjs/mos-plugin-package-json): A mos plugin that makes the package.json available in the markdown scope
- [mos-plugin-shields](https://github.com/mosjs/mos-plugin-shields): A mos plugin for creating markdown shields
- [mos-plugin-snippet](https://github.com/mosjs/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [mos-plugin-toc](https://github.com/mosjs/mos-plugin-toc): A mos plugin for creating Table of Contents
- [mos-processor](https://github.com/mosjs/mos-processor): A markdown processor for mos
- [normalize-newline](https://github.com/sindresorhus/normalize-newline): Normalize the newline characters in a string to `\n`
- [normalize-path](https://github.com/jonschlinkert/normalize-path): Normalize file path slashes to be unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes.
- [rcfile](https://github.com/zkochan/rcfile): Loads library configuration in all possible ways
- [relative](https://github.com/jonschlinkert/relative): Get the relative filepath from path A to path B. Calculates from file-to-directory, file-to-file, directory-to-file, and directory-to-directory.
- [resolve](https://github.com/substack/node-resolve): resolve like require.resolve() on behalf of files asynchronously and synchronously
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers
- [update-notifier](https://github.com/yeoman/update-notifier): Update notifications for your CLI app

<!--/@-->

<!--@devDependencies({ shield: true })-->
## <a name="dev-dependencies">Dev Dependencies</a> [![devDependency status](https://img.shields.io/david/dev/mosjs/mos/master.svg)](https://david-dm.org/mosjs/mos/master#info=devDependencies)

- [babel-cli](https://github.com/babel/babel/blob/master/packages): Babel command line.
- [babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports): Fix babel/babel#2212
- [babel-plugin-syntax-object-rest-spread](https://github.com/babel/babel/blob/master/packages): Allow parsing of object rest/spread
- [babel-plugin-transform-es2015-spread](https://github.com/babel/babel/blob/master/packages): Compile ES2015 spread to ES5
- [babel-plugin-transform-object-rest-spread](https://github.com/babel/babel/blob/master/packages): Compile object rest and spread to ES5
- [babel-plugin-transform-runtime](https://github.com/babel/babel/blob/master/packages): Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals
- [babel-preset-es2015](https://github.com/babel/babel/blob/master/packages): Babel preset for all es2015 plugins.
- [babel-register](https://github.com/babel/babel/blob/master/packages): babel require hook
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [core-js](https://github.com/zloirock/core-js): Standard library
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [execa](https://github.com/sindresorhus/execa): A better `child_process`
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos-plugin-readme](https://github.com/mosjs/mos-plugin-readme): A mos plugin for generating README
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->

* * *

**What does mos mean?**
<br>
It means _Markdown on Steroids_!

[readme]: https://raw.githubusercontent.com/mosjs/mos/master/README.md

[mos-plugin-package-json]: https://github.com/mosjs/mos-plugin-package-json

[mos-plugin-example]: https://github.com/mosjs/mos-plugin-example

[mos-plugin-shields]: https://github.com/mosjs/mos-plugin-shields
