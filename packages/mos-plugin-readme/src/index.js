import path from 'path'
import m from 'markdownscript'
const {h1, blockquote} = m

export default function plugin (mos, markdown) {
  const mdbasename = path.basename(markdown.filePath)
  if (mdbasename.match(/^readme\./i)) {
    mos.compile.pre((next, root, opts) => {
      const title = h1([markdown.pkg.name])
      const firstChild = root.children[0]
      if (firstChild && firstChild.type === 'heading' && firstChild.depth === 1) {
        root.children[0] = title
      } else {
        root.children.unshift(title)
      }

      const shortDescr = blockquote([markdown.pkg.description])
      if (root.children[1] && root.children[1].type === 'blockquote') {
        root.children[1] = shortDescr
      } else {
        root.children.splice(1, 0, shortDescr)
      }

      if (!(root.children[2] && root.children[2].type === 'markdownScript' && root.children[2].code.match(/\bshields\b/))) {
        root.children.splice(2, 0, m('markdownScript', {
          code: "shields('npm', 'travis')",
        }, []))
      }

      return next.applySame()
    })
  }
}

plugin.attributes = {
  pkg: require('../package.json'),
}
