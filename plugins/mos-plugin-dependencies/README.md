# mos-plugin-dependencies

A mos plugin that adds that creates a dependencies section


## Usage

Add this code snippet somewhere in your markdown file:

``` md
<!--@dependencies()-->
<!--/@-->
```

Run `mos` in the terminal.

You'll get a dependencies section with the list of the dependencies used in the package.

``` md
## Dependencies

- [async-regex-replace](https://github.com/pmarkert/async-regex-replace): regex replacements using asynchronous callback functions
- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
```


## API

`dependencies(opts)` - create a section with the list of dependencies

`devDependencies(opts)` - create a section with the list of dev dependencies

* `opts.shield` - *boolean* or *string* - tells whether to add a dependency shield or not. If `true`, adds a shield using default styling. If a `string`, adds a shield with the style specified by the string. Is `false` by default.
