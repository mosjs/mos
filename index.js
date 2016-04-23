'use strict'
process.on('unhandledRejection', function (reason, p) {
  console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ',
    reason)
})

module.exports = require('./lib')
