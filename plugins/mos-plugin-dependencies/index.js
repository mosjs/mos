'use strict'
module.exports = plugin

const renderDeps = require('./lib/render-deps')
const shielder = require('shields')

function plugin (markdown) {
  return {
    dependencies: opts => {
      opts = opts || {}

      return `## Dependencies${maybeShield('deps', opts.shield)}\n\n${
        renderDeps({
          deps: markdown.pkg.dependencies,
          pkgRoot: markdown.pkgRoot,
        })
      }\n`
    },
    devDependencies: opts => {
      opts = opts || {}

      return `## Dev Dependencies${maybeShield('devDeps', opts.shield)}\n\n${
        renderDeps({
          deps: markdown.pkg.devDependencies,
          pkgRoot: markdown.pkgRoot,
        })
      }\n`
    },
  }

  function maybeShield (shieldName, style) {
    if (!~['boolean', 'string'].indexOf(typeof style) || !style) {
      return ''
    }

    style = style === true ? 'flat' : style

    testRepo(markdown.repo)

    const getShieldProps = shielder({style})
    const shieldProps = getShieldProps(shieldName, {
      repo: `${markdown.repo.user}/${markdown.repo.repo}`,
      branch: 'master',
    })

    return ` ${renderShield(shieldProps)}`
  }
}

function testRepo (repo) {
  if (!repo || repo.host !== 'github.com') {
    throw new Error('The shields plugin only works for github repos')
  }
}

function renderShield (shieldProps) {
  return `[![${shieldProps.text}](${shieldProps.image})](${shieldProps.link})`
}
