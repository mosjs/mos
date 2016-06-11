'use strict'
module.exports = jsToMarkdown

function jsToMarkdown (code) {
  if (!code.trim()) return ''

  const match = /\n*\/\/!(.+)\n*|\n*\/\*!([\s\S]+?)\*\/\n*/.exec(code)

  if (!match) return codeBlock(code)

  const comment = (match[1] || match[2]).trim().replace(/\n\s+/g, '\n')

  const beforeCode = code.slice(0, match.index).trim()
  const afterCode = code.slice(match.index + match[0].length, code.length).trim()

  const rest = jsToMarkdown(afterCode)
  return (beforeCode ? `${codeBlock(beforeCode)}\n\n` : '') + comment +
    (rest ? '\n\n' + rest : '')
}

function codeBlock (code) {
  return '``` js\n' + code + '\n```'
}
