import readPkgUp from 'mos-read-pkg-up'
import gh from 'github-url-to-object'
import path from 'path'

export type MarkdownMeta = {
  pkg: {
    name: string,
    version: string,
  },
  pkgRoot: string,
  repo: {
    user: string,
    repo: string
  },
  filePath: string,
}

export default function getMarkdownMeta (filePath: string): Promise<MarkdownMeta> {
  return readPkgUp({cwd: filePath})
    .then(result => {
      const pkg = result.pkg

      if (!pkg) {
        return {}
      }

      return {
        pkg,
        pkgRoot: path.dirname(result.path),
        repo: pkg.repository && pkg.repository.url && gh(pkg.repository.url),
      }
    })
    .then(opts => Object.assign(opts, {filePath}))
}
