export default function plugin (mos, md) {
  mos.scope.pkg = md.pkg
}

plugin.attributes = {
  pkg: require('../package.json'),
}
