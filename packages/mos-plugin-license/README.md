# mos-plugin-license

> A mos plugin for generating a license section

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![npm version](https://img.shields.io/npm/v/mos-plugin-license.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-license) [![Build Status](https://img.shields.io/travis/mosjs/mos-plugin-license/master.svg?style=flat-square)](https://travis-ci.org/mosjs/mos-plugin-license) [![Coverage Status](https://img.shields.io/coveralls/mosjs/mos-plugin-license/master.svg?style=flat-square)](https://coveralls.io/r/mosjs/mos-plugin-license?branch=master)
<!--/@-->

## Installation

```sh
npm i -D mos-plugin-license
```

## Usage

Add this code snippet to the footer of your `README.md`

```md
<!--@license()-->
<!--/@-->
```

Run `mos` in the terminal.

You'll get a license section with the license and author specified in the `package.json`.

## API

`license()`

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
