# mos-plugin-example

A mos plugin that combines example code files with their output


## Usage

There is an [example.js](./example.js) file in the current directory. Its content is:

``` js
console.log('Hello world!')

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))

function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
  }
}

printEachLetter('Hello world!')
```

We can load this file via the example plugin. The mos plugin will execute the code in the file and combine the output of the `console.log`s with the code.

In the current `README.md` we have this code snippet:

<!&dash;-@example('./example.js')-&dash;>
<br>
<!&dash;-/@-&dash;>

It produces this code block, with the outputs written under the `console.log`s inside comments:

<!--@example('./example.js')-->
``` js
console.log('Hello world!')
//> Hello world!

function sum (a, b) {
  return a + b
}

console.log(sum(1, 2))
//> 3

function printEachLetter (text) {
  for (let i = 0; i < text.length; i++) {
    console.log(text[i])
  }
}

printEachLetter('Hello world!')
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
```
<!--/@-->


## API

`example(relativePathToFile)`
