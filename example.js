//! Require the package

const mos = require('.')

//! Create a processor and use some mos plugins

const processor = mos().use(require('mos-plugin-scripts'))

//! Process raw markdown

processor.process('# Header', { filePath: 'README.md' })
  .then(newmd => console.log(newmd))

//! Process a markdown AST

const m = require('markdownscript')
const h1 = m.h1
const p = m.paragraph
const ast = m.root([
  h1(['Foo']),
  p(['Bar qar qax']),
])
processor.process(ast, { filePath: 'README.md' })
  .then(newmd => console.log(newmd))
