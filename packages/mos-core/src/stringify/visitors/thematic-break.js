import repeat from 'repeat-string'

export default compiler => {
  const rule = repeat(compiler.options.rule, compiler.options.ruleRepetition)

  if (!compiler.options.ruleSpaces) return rule

  return rule.split('').join(' ')
}
