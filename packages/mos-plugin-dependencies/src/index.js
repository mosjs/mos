import renderDeps from './render-deps'
const shield = require('shieldman')

export default function plugin (mos, markdown) {
  mos.scope.dependencies = opts => {
    opts = opts || {}

    return `## <a name="dependencies">Dependencies</a>${maybeShield('deps', opts.shield)}\n\n${
      renderDeps({
        deps: markdown.pkg.dependencies,
        pkgRoot: markdown.pkgRoot,
      })
    }\n`
  }

  mos.scope.devDependencies = opts => {
    opts = opts || {}

    return `## <a name="dev-dependencies">Dev Dependencies</a>${maybeShield('devDeps', opts.shield)}\n\n${
      renderDeps({
        deps: markdown.pkg.devDependencies,
        pkgRoot: markdown.pkgRoot,
      })
    }\n`
  }

  function maybeShield (shieldName, style) {
    if (!~['boolean', 'string'].indexOf(typeof style) || !style) {
      return ''
    }

    style = style === true ? null : style

    testRepo(markdown.repo)

    const shieldProps = shield(shieldName, {
      repo: `${markdown.repo.user}/${markdown.repo.repo}`,
      branch: 'master',
      style,
    })

    return ` ${renderShield(shieldProps)}`
  }
}

plugin.attributes = {
  pkg: require('../package.json'),
}

function testRepo (repo) {
  if (!repo || repo.host !== 'github.com') {
    throw new Error('The shields plugin only works for github repos')
  }
}

function renderShield (shieldProps) {
  return `[![${shieldProps.text}](${shieldProps.image})](${shieldProps.link})`
}
