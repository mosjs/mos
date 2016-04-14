'use strict'
module.exports = renderDeps

const getDeps = require('./get-deps')

function renderDeps (opts) {
  const depDetails = getDeps(opts)

  if (!depDetails.length) return 'None'

  return depDetails
    .map(depDetails => `- [${depDetails.name}](${getDepURL(depDetails)}): ${depDetails.description.trim()}`)
    .join('\n')
}

function getDepURL (depDetails) {
  if (depDetails.repository) return depDetails.repository.url

  return `https://npmjs.org/package/${depDetails.name}`
}
