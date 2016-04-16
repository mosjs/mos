# mos-plugin-shields

A mos plugin that adds shields generator to the markdown scope

## Usage

Add this code snippet to your `README.md`

```md
<!--@shields('travis', 'dependencies')-->
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
