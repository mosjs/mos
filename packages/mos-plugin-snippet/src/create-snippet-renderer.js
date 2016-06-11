import path from 'path'
import fs from 'fs'
import removeLastEOL from './remove-last-eol'

const regexes = {
  js: '// *#{anchor}\n([\\s\\S]*?)// *#',
  css: '/\\* *#{anchor} *\\*/\n([\\s\\S]*?)/\\* *# *\\*/',
  html: '<!-- *#{anchor} *-->\n([\\s\\S]*?)<!-- *# *-->',
  md: '<!-- *#{anchor} *-->\n([\\s\\S]*?)<!-- *# *-->',
}

export default markdown => {
  const markdownDir = path.dirname(markdown.filePath)

  return (snippetId, opts) => {
    opts = opts || {}
    const snippet = parseSnippetId(snippetId)

    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(markdownDir, snippet.filePath), 'utf8', (err, code) => {
        if (err) return reject(err)

        try {
          return resolve(getSnippetFromCode(code, snippet, opts))
        } catch (err) {
          return reject(err)
        }
      })
    })
  }
}

function getSnippetFromCode (code, snippet, opts) {
  if (!snippet.anchor) {
    return fenceCode(removeLastEOL(code), snippet.extension) +
      (!opts.showSource ? ''
        : `\n> File [${snippet.filePath}](${snippet.filePath})`)
  }

  const regex = new RegExp(regexes[snippet.extension].replace('{anchor}', snippet.anchor))
  const matches = code.match(regex)

  if (!matches || !matches[1]) {
    throw new Error("Couldn't find anchor #" + snippet.anchor)
  }

  const codeSnippet = removeLastEOL(matches[1])

  const fencedCodeSnippet = fenceCode(codeSnippet, snippet.extension)

  if (!opts.showSource) {
    return fencedCodeSnippet
  }

  const beforeSnippet = code.substr(0, matches.index)
  const snippetFirstLine = getLinesCount(beforeSnippet) + 1
  const snippetLastLine = snippetFirstLine + getLinesCount(codeSnippet) - 1

  return [
    fencedCodeSnippet,
    `> Excerpt from [${snippet.filePath}](${snippet.filePath}#L${snippetFirstLine}-L${snippetLastLine})`,
  ].join('\n')
}

function fenceCode (code, language) {
  return [
    '``` ' + language,
    code,
    '```',
  ].join('\n')
}

function getLinesCount (text) {
  const matches = text.match(/\n/g) || []
  return matches.length + 1
}

function parseSnippetId (id) {
  const idParts = id.split('#')
  return {
    filePath: idParts[0],
    anchor: idParts[1],
    extension: path.extname(idParts[0]).substr(1),
  }
}
