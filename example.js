//! Require the package

const mos = require('.')

//! Create a processor and use some mos plugins

const processor = mos().use(require('mos-plugin-scripts'))

//! Process raw markdown

processor.process('# Header', { filePath: 'README.md' })
  .then(newmd => console.log(newmd))

//! Process a markdown AST

const m = require('markdownscript')
const ast = m.root([
  m.heading({ depth: 1 }, [
    m.text({ value: 'Foo' }),
  ]),
  m.paragraph([
    m.text({
      value: 'Bar qar qax',
    }),
  ]),
])
processor.process(ast, { filePath: 'README.md' })
  .then(newmd => console.log(newmd))
