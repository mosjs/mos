'use strict'
const m = require('markdownscript')
const heading = m.heading
const text = m.text
const paragraph = m.paragraph
const code = m.code

module.exports = pkg => {
  if (pkg.private) {
    throw new Error('Cannot generate installation section for a private module')
  }
  return [
    heading({ depth: 2 }, [
      text({
        value: 'Installation',
      }),
    ]),
    paragraph([
      text({
        value: 'This module is installed via npm:',
      }),
    ]),
    code({
      lang: 'sh',
      value: `npm install ${pkg.name} ${pkg.preferGlobal ? '--global' : '--save'}`,
    }),
  ]
}
