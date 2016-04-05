# mos-plugin-example

A mos plugin that combines example code files with their output


## Usage

There is an [example/index.js](./example/index.js) file in this module. Its content is:

``` js
'use strict'
console.log('Hello world!')

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))

//! Comments that start with an exclamation will be inserted into the markdown outside the code block.

function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
  }
}

printEachLetter('Hello world!')
```

We can load this file via the example plugin. The mos plugin will execute the code in the file and combine the output of the `console.log`s with the code.

In the current `README.md` we have this code snippet:

``` md
<!--@example('./example/index.js')-->
<!--/@-->
```

It produces this code block, with the outputs written under the `console.log`s inside comments:

<!--@example('./example/index.js')-->
``` js
'use strict'
console.log('Hello world!')
//> Hello world!

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))
//> 3
```

Comments that start with an exclamation will be inserted into the markdown outside the code block.

``` js
function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
    //> H
    //> e
    //> l
    //> l
    //> o
    //>  
    //> w
    //> o
    //> r
    //> l
    //> d
    //> !
  }
}

printEachLetter('Hello world!')
```
<!--/@-->


## ES6

example/ can be written in ES6, but they have to be loaded with `example.es6`.

Mos uses [rollup](http://rollupjs.org) and [babel](babeljs.io) to transpile the example written ES6.
However, babel is not installed with mos, so you'll have to install babel manually. Put a `.babelrc` file in
your example folder and configure babel the way it is described [here](https://github.com/rollup/rollup-plugin-babel/tree/v2.4.0#configuring-babel).

Here is an example that is using ES6 in the current package:

<!--@example.es6('./example/es6.js')-->
``` js
const sum = (a, b) => a + b

const numbers = [1, 2]
console.log(sum(...numbers))
//> 3
```
<!--/@-->


## API

* `example(relativePathToFile)`
* `example.es6(relativePathToFile)` - process an example written in ES6
