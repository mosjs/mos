<!--@'# ' + package.name-->
# mos
<!--/@-->

<!--@package.description-->
Keeps your markdown files up to date
<!--/@-->

<!--@badges.flatSquare('travis', 'dependencies', 'coveralls', 'npm')-->
[![Build Status](https://img.shields.io/travis/zkochan/mos.svg?style=flat-square)](https://travis-ci.org/zkochan/mos?branch=master)
[![David](https://img.shields.io/david/zkochan/mos.svg?style=flat-square)](https://david-dm.org/zkochan/mos)
[![Coveralls](https://img.shields.io/coveralls/zkochan/mos.svg?style=flat-square)](https://coveralls.io/r/zkochan/mos)
[![npm](https://img.shields.io/npm/v/mos.svg?style=flat-square)](https://www.npmjs.com/package/mos)
<!--/@-->


## TL;DR

*MOS = Markdown on Steroids!* Mos allows to inject content into your markdown files via hidden JavaScript snippets inside your md files. [This README](https://raw.githubusercontent.com/zkochan/mos/master/README.md) uses Mos.

![](http://i.imgur.com/GmU6VLR.png)


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
* [badges](./plugins/mos-plugin-badges)
* [license](./plugins/mos-plugin-license)
* [installation](./plugins/mos-plugin-installation)
* [example](./plugins/mos-plugin-example)


## Commands

* **mos** - regenerate the markdown files if they are out of date.

* **mos test** - test the markdown files. Fails if can't generate one of the markdown files or one of the markdown files is out of date. It is recommended to add this command to the `scripts.test` property of `package.json`.


<!--@license()-->
## License

MIT © [Zoltan Kochan](http://kochan.io)
<!--/@-->
