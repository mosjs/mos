import fileExists from 'file-exists'
import path from 'path'
import m from 'markdownscript'
import toString from 'mdast-util-to-string'
const {h2, link, paragraph} = m

export default function plugin (mos, markdown) {
  Object.assign(mos.scope, {
    license: compileLicense,
  })

  mos.compile.pre((next, ast, opts) => {
    ast.children = updateLicenseSection(ast.children)
    return next(ast, opts)
  })

  function compileLicense () {
    const licensePath = path.resolve(path.dirname(markdown.filePath), 'LICENSE')
    const licenseFileExists = fileExists(licensePath)

    return [
      h2(['License']),
      paragraph([
        (licenseFileExists
          ? link({url: './LICENSE'}, [markdown.pkg.license])
          : markdown.pkg.license),
        ' © ',
        (markdown.pkg.author.url
          ? link({url: markdown.pkg.author.url}, [markdown.pkg.author.name])
          : markdown.pkg.author.name),
      ]),
    ]
  }

  function updateLicenseSection (children) {
    if (!children.length) {
      return []
    }
    const child = children.shift()
    if (child.type === 'heading' && toString(child).match(/^licen[cs]e$/i)) {
      return compileLicense().concat(removeSection(children))
    }
    return [child].concat(updateLicenseSection(children))
  }

  function removeSection (children) {
    if (!children.length) {
      return []
    }
    const child = children.shift()
    if (~['heading', 'markdownScript', 'thematicBreak'].indexOf(child.type)) {
      return [child].concat(children)
    }
    return removeSection(children)
  }
}

plugin.attributes = {
  pkg: require('../package.json'),
}
