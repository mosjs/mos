<!--@h1([pkg.name])-->
# mos-plugin-shields
<!--/@-->

<!--@blockquote([pkg.description])-->
> A mos plugin for creating markdown shields
<!--/@-->

<!--@shields.flatSquare('npm')-->
[![npm version](https://img.shields.io/npm/v/mos-plugin-shields.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-shields)
<!--/@-->

## Installation

```sh
npm install --save mos-plugin-shields
```

## Usage

Add this code snippet to your `README.md`

```md
<!--@shields('travis', 'deps')-->
<!--/@-->
```

Run `mos` in the terminal.

You'll get the travis and david shields in your readme via [shield.io](http://shields.io/).

## API

- `shields(...shields)`
- `shields.flat(...shields)`
- `shields.flatSquare(...shields)`
- `shields.plastic(...shields)`

The currently supported shields are: travis, coveralls, npm, deps, devDeps, peerDeps, gemnasium, climate.

**NOTE:** The shields will be created for the master branch.

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
