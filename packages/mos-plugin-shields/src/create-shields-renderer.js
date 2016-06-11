import shield from 'shieldman'

const slice = Array.prototype.slice

export default opts => {
  const github = opts.github
  const pkg = opts.pkg

  const shields = styledShield()
  shields.flat = styledShield('flat')
  shields.flatSquare = styledShield('flat-square')
  shields.plastic = styledShield('plastic')

  return shields

  function styledShield (style) {
    const shieldOpts = {
      repo: `${github.user}/${github.repo}`,
      npmName: pkg.name,
      branch: 'master',
      style,
    }
    return function () {
      const shields = slice.call(arguments)
      return shields
        .map(shieldName => {
          const shieldProps = shield(shieldName, shieldOpts)
          if (!shieldProps) {
            throw new Error('`' + shieldName + '` shield is not supported')
          }
          return shieldProps
        })
        .map(renderShield)
        .join(' ')
    }
  }
}

function renderShield (shieldProps) {
  return `[![${shieldProps.text}](${shieldProps.image})](${shieldProps.link})`
}
