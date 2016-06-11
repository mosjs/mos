const gh = require('github-url-to-object')
const path = require('path')

export default function getDeps (opts) {
  return Object.keys(opts.deps || {}).map(depname => {
    const reqPath = `${opts.pkgRoot}/node_modules/${depname}/package.json`
    const dep = require(path.resolve(reqPath))
    if (dep.repository && dep.repository.url && gh(dep.repository.url)) {
      dep.repository.url = gh(dep.repository.url).https_url
    }
    return dep
  })
}
