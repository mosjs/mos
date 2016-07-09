import runAsync from 'babel-run-async'

export type EvalOptions = {
  useStrict?: boolean
}

export type ScopeEval = {
  (code: string): Promise<string>
}

export default function createAsyncScopeEval (scope: Object, opts?: EvalOptions): ScopeEval {
  opts = opts || {}
  const mdVarNames: string[] = []
  const mdVarValues: Object[] = []

  Object.keys(scope || {})
    .map(scopeVarName => {
      mdVarNames.push(scopeVarName)
      mdVarValues.push(scope[scopeVarName])
    })

  return <ScopeEval>runAsync((code: string) => {
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
