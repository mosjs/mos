<!--@h1([pkg.name])-->
# mos-plugin-installation
<!--/@-->

<!--@blockquote([pkg.description])-->
> A mos plugin for creating installation section
<!--/@-->

<!--@shields.flatSquare('npm')-->
[![NPM version](https://img.shields.io/npm/v/mos-plugin-installation.svg?style=flat-square)](https://www.npmjs.com/package/mos-plugin-installation)
<!--/@-->

<!--@installation({useShortAlias: true})-->
## Installation

```sh
npm i -S mos-plugin-installation
```
<!--/@-->

## Usage

Add this code snippet to your `README.md`

```md
<!--@installation()-->
<!--/@-->
```

Run `mos` in the terminal.

You'll get an installation section in your README that will instruct how to install the package via npm.

The plugin will use information from the `package.json` in order to figure out what should the installation command look like.

- If there is a `preferGlobal: true` specified in the `package.json`, the generated command will be `npm install --global`
- If there is a `preferDev: true` specified in the `package.json`, the generated command will be `npm install --save-dev`
- If there is a `private: true`, the command instruction will suggest to clone the repo and install its dependencies
- Otherwise, the generated command will be `npm install --save`

If the package has `peerDependencies`, the installation command will suggest to install all the peer dependencies with the package.

## API

`installation(opts)`

- `opts.useShortAlias` - _Boolean_, false by default. If true, uses shorter aliases in the installation command. `i` instead of `install`, `-S` instead of `--save`, etc.

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->
