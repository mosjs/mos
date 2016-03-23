<!--@'# ' + package.name-->
# mos
<!--/@-->

<!--@package.description-->
Keeps your markdown files up to date
<!--/@-->

<!--@badges.flatSquare(['travis', 'dependencies', 'coveralls', 'npm'])-->
[![Build Status](https://img.shields.io/travis/zkochan/mos.svg?style=flat-square)](https://travis-ci.org/zkochan/mos?branch=master)
[![David](https://img.shields.io/david/zkochan/mos.svg?style=flat-square)](https://david-dm.org/zkochan/mos)
[![Coveralls](https://img.shields.io/coveralls/zkochan/mos.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos)
[![npm](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos)
<!--/@-->


<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install mos --save
```
<!--/@-->


## Example Usage

``` js
const liveReadme = require('live-readme')
```


## Commands

**mos** - regenerate the markdown files. It is recommended to add this command to the `scripts.prepublish` property of `package.json`.

**mos test** - test the markdown files. Fails if can't generate one of the markdown files or one of the markdown files is out of date. It is recommended to add this command to the `scripts.test` property of `package.json`.


<!--@license()-->
## License

MIT © [Zoltan Kochan](http://kochan.io)
<!--/@-->
