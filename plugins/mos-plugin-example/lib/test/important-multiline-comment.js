function repeatText (text, times) {
  return Array(times).fill(text).join('')
}

/*! This is an important comment
    and it is on multiple lines! */

console.log(repeatText('foo', 3))
