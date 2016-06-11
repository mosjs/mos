import ejsPlugin from './ejs-plugin'

export default function plugin (mos, md) {
  Object.assign(mos.scope, ejsPlugin(md))
}

plugin.attributes = {
  pkg: require('../package.json'),
}
