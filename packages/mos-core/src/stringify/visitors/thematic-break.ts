import {Visitor} from '../visitor'

const visitor: Visitor = compiler => {
  const rule = compiler.options.rule.repeat(compiler.options.ruleRepetition)

  if (!compiler.options.ruleSpaces) {
    return rule
  }

  return rule.split('').join(' ')
}

export default visitor
