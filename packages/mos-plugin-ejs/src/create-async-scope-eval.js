import runAsync from 'babel-run-async'

export default function createAsyncScopeEval (scope, opts) {
  opts = opts || {}
  const mdVarNames = []
  const mdVarValues = []

  Object.keys(scope || {})
    .map(scopeVarName => {
      mdVarNames.push(scopeVarName)
      mdVarValues.push(scope[scopeVarName])
    })

  return runAsync(code => {
    const funcBody = `${opts.useStrict ? "'use strict';" : ''}return (${code})`
    try {
      return Function
        .apply(null, mdVarNames.concat(funcBody))
        .apply(null, mdVarValues)
    } catch (err) {
      return Promise.reject(err)
    }
  })
}
