<!--@'# ' + package.name-->
# mos
<!--/@-->

<!--@package.description-->
Keeps your markdown files up to date
<!--/@-->

<!--@shields.flatSquare('travis', 'deps', 'coveralls', 'npm')-->
[![Build status](https://img.shields.io/travis/zkochan/mos.svg?style=flat-square)](https://travis-ci.org/zkochan/mos)
[![Dependency status](https://img.shields.io/david/zkochan/mos.svg?style=flat-square)](https://david-dm.org/zkochan/mos)
[![Test coverage](https://img.shields.io/coveralls/zkochan/mos.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos?branch=master)
[![NPM version](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos)
<!--/@-->


## TL;DR

*MOS = Markdown on Steroids!* Mos allows to inject content into your markdown files via hidden JavaScript snippets inside your md files. [This README](https://raw.githubusercontent.com/zkochan/mos/master/README.md) uses Mos.

![](http://i.imgur.com/tXcB20W.png)


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

<!&dash;-@'# ' + package.name-&dash;>
<br>
<!&dash;-/@-&dash;>

If you view your readme now, it will be empty. However, you have the code that can insert the title in your readme. All you have to do now is to run `mos` in a terminal.

Once you've ran `mos`, the readme will look like this:

<!&dash;-@'# ' + package.name-&dash;>
<br>
\# my-awesome-module
<br>
<!&dash;-/@-&dash;>

Now your readme has both the code that generates the content and the content itself. However, only the content is visible after the readme is generated to HTML by GitHub or npm. Awesome!

![Happy cat](http://i.imgur.com/JG9BXxe.jpg)


## Plugins

In the usage example the `package` variable was used to access the package info. The variables available in the markdown scope are *declared by mos plugins*. The `package` variable is create by the [package-json](./plugins/package-json) plugin.

There are a few mos plugins that are installed with mos by default:

* [package-json](./plugins/mos-plugin-package-json)
* [shields](./plugins/mos-plugin-shields)
* [license](./plugins/mos-plugin-license)
* [installation](./plugins/mos-plugin-installation)
* [example](./plugins/mos-plugin-example)
* [dependencies](./plugins/mos-plugin-dependencies)

Do you want to write a new one? Read the [plugins readme](./plugins/README.md).


## Commands

### `mos`

Regenerate the markdown files if they are out of date.


### `mos test`

Test the markdown files. Fails if can't generate one of the markdown files or one of the markdown files is out of date. It is recommended to add this command to the `scripts.test` property of `package.json`.


#### Optional TAP output

Mos can generate TAP output via `--tap` option for use with any [TAP reporter](https://github.com/sindresorhus/awesome-tap#reporters).

``` console
mos test --tap | tap-nyan
```


<!--@dependencies()-->
## Dependencies

- [async-regex-replace](https://github.com/pmarkert/async-regex-replace): regex replacements using asynchronous callback functions
- [callsites](https://github.com/sindresorhus/callsites): Get callsites from the V8 stack trace API
- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [glob](https://github.com/isaacs/node-glob): a little globber
- [meow](https://github.com/sindresorhus/meow): CLI app helper
- [normalize-newline](https://github.com/sindresorhus/normalize-newline): Normalize the newline characters in a string to `\n`
- [normalize-path](https://github.com/jonschlinkert/normalize-path): Normalize file path slashes to be unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes.
- [read-pkg-up](https://github.com/sindresorhus/read-pkg-up): Read the closest package.json file
- [relative](https://github.com/jonschlinkert/relative): Get the relative filepath from path A to path B. Calculates from file-to-directory, file-to-file, directory-to-file, and directory-to-directory.
- [resolve](https://github.com/substack/node-resolve): resolve like require.resolve() on behalf of files asynchronously and synchronously
- [run-async](https://github.com/sboudrias/run-async): Utility method to run function either synchronously or asynchronously using the common `this.async()` style.
- [shields](https://github.com/kenany/shields): Generate shields for your current project's README
- [tap-diff](https://github.com/axross/tap-diff): The most human-friendly TAP reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers

<!--/@-->


<!--@devDependencies()-->
## Dev Dependencies

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


<!--@license()-->
## License

MIT © [Zoltan Kochan](http://kochan.io)
<!--/@-->
