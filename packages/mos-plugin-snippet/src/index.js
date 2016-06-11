import createSnippetRenderer from './create-snippet-renderer'

export default function plugin (mos, md) {
  mos.scope.snippet = createSnippetRenderer(md)
}

plugin.attributes = {
  pkg: require('../package.json'),
}
