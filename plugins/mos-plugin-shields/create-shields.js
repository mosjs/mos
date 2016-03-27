'use strict'
const shielder = require('shields')

const slice = Array.prototype.slice

module.exports = opts => {
  const github = opts.github
  const pkg = opts.pkg

  const shields = styledShield('flat')
  shields.flat = styledShield('flat')
  shields.flatSquare = styledShield('flat-square')
  shields.plastic = styledShield('plastic')

  return shields

  function styledShield (style) {
    const getShieldProps = shielder({ style })
    const shieldOpts = {
      repo: github.user + '/' + github.repo,
      npmName: pkg.name,
    }
    return function () {
      const shields = slice.call(arguments)
      return shields
        .map(shieldName => getShieldProps(shieldName, shieldOpts))
        .map(createShieldMD)
        .join('\n')
    }
  }
}

function createShieldMD (shieldProps) {
  return `[![${shieldProps.text}](${shieldProps.image})](${shieldProps.link})`
}
