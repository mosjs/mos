# How to create a mos plugin?

A mos plugin is a pure function that accepts a `markdown` parameter and returns an object that extends the markdown's scope.

For instance, if you want to extend the markdown's scope with a `sum` function, you can write a plugin like this one:

``` js
module.exports = markdown => ({
  sum (a, b) {
    return a + b
  }
})
```

A plugin can return a Promise as well:

``` js
module.exports = markdown => Promise.resolve({
  sum (a, b) {
    return a + b
  }
})
```

The function in the scope can return the generated markdown content through Promise:

``` js
module.exports = markdown => ({
  sum (a, b) {
    return new Promise(resolve => setTimeout(() => resolve(a + b), 1000))
  }
})
```

The markdown object properties:

* `filePath` - the path to the markdown file


## Naming convention

The name of plugin package has to be prefixed with `mos-plugin-`. Otherwise it won't be detected by mos.
It is recommended to also add the `mos-plugin` keyword to the `keywords` property of the plugin's `package.json`.
This will make it easier to search for mos plugins on npm.
