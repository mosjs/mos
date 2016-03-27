'use strict'
module.exports = createDeps

const getDeps = require('./get-deps')

function createDeps (opts) {
  const depDetails = getDeps(opts)

  if (!depDetails.length) return 'None'

  return depDetails
    .map(depDetails => '- ' + '[' + depDetails.name + '](' +
      depDetails.repository.url + '): ' + depDetails.description)
    .join('\n')
}
