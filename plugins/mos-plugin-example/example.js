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
