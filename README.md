<!--@`\n# ${package.name}\n` -->
# mos
<!--/@-->

<!--@`\n${package.description}\n` -->
Keeps your markdown files up to date
<!--/@-->

[![Dependency Status](https://david-dm.org/zkochan/live-readme/status.svg?style=flat)](https://david-dm.org/zkochan/live-readme)
[![Build Status](https://travis-ci.org/zkochan/live-readme.svg?branch=master)](https://travis-ci.org/zkochan/live-readme)
[![npm version](https://badge.fury.io/js/live-readme.svg)](http://badge.fury.io/js/live-readme)
[![Coverage Status](https://coveralls.io/repos/zkochan/live-readme/badge.svg?branch=master&service=github)](https://coveralls.io/github/zkochan/live-readme?branch=master)


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
