'use strict'
const slice = Array.prototype.slice
const badgeCreators = {
  travis: travisBadge,
  dependencies: dependenciesBadge,
  coveralls: coverallsBadge,
  npm: npmBadge,
}

module.exports = opts => {
  const github = opts.github
  const pkg = opts.pkg

  const badges = styledBadge('flat')
  badges.flat = styledBadge('flat')
  badges.flatSquare = styledBadge('flat-square')
  badges.plastic = styledBadge('plastic')

  return badges

  function styledBadge (style) {
    const badgeOpts = Object.assign({}, github, {style, pkg})
    return function () {
      const badges = slice.call(arguments)
      return badges
        .map(badgeName => badgeCreators[badgeName])
        .map(createBade => createBade(badgeOpts))
        .join('\n')
    }
  }
}

function travisBadge (opts) {
  return createBadge({
    name: 'Build Status',
    imageURL: 'https://img.shields.io/travis/' +
      opts.user + '/' + opts.repo + '.svg?style=' + opts.style,
    url: 'https://travis-ci.org/' + opts.user + '/' + opts.repo +
      '?branch=master',
  })
}

function dependenciesBadge (opts) {
  return createBadge({
    name: 'David',
    imageURL: 'https://img.shields.io/david/' + opts.user + '/' +
      opts.repo + '.svg?style=' + opts.style,
    url: `https://david-dm.org/${opts.user}/${opts.repo}`,
  })
}

function coverallsBadge (opts) {
  return createBadge({
    name: 'Coveralls',
    imageURL: 'https://img.shields.io/coveralls/' +
      `${opts.user}/${opts.repo}.svg?style=${opts.style}`,
    url: `https://coveralls.io/r/${opts.user}/${opts.repo}`,
  })
}

function npmBadge (opts) {
  return createBadge({
    name: 'npm',
    imageURL: `https://img.shields.io/npm/v/${opts.pkg.name}.svg?` +
      `style=${opts.style}`,
    url: `https://www.npmjs.com/package/${opts.pkg.name}`,
  })
}

function createBadge (opts) {
  return `[![${opts.name}](${opts.imageURL})](${opts.url})`
}
