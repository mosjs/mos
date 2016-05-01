# mos-plugin-installation

A mos plugin that adds an installation section generator to the markdown scope

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
- If there is a `private: true`, the command instruction will suggest to clone the repo and install its dependencies
- Otherwise, the generated command will be `npm install --save`

## API

`installation()`
