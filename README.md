**This project is currently not maintained. [projectz](https://www.npmjs.com/package/projectz) may satisfy your needs.**

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
- [license](packages/mos-plugin-license)
- [installation](packages/mos-plugin-installation)
- [example][mos-plugin-example]
- [dependencies](packages/mos-plugin-dependencies)
- [snippet](packages/mos-plugin-snippet)
- [table-of-contents](packages/mos-plugin-toc)
- [markdownscript](packages/mos-plugin-markdownscript)

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

**What does mos mean?**
<br>
It means _Markdown on Steroids_!

[readme]: https://raw.githubusercontent.com/mosjs/mos/master/README.md

[mos-plugin-package-json]: packages/mos-plugin-package-json

[mos-plugin-example]: packages/mos-plugin-example

[mos-plugin-shields]: packages/mos-plugin-shields
