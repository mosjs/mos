import {Plugin, Processor, PluginOptions} from 'mos-processor'
import createSnippetRenderer from './create-snippet-renderer'
import readPkgUp from 'mos-read-pkg-up'

const plugin: Plugin = Object.assign(function (mos: Processor, md: PluginOptions) {
  mos['scope'].snippet = createSnippetRenderer(md)
}, {
  attributes: { pkg: readPkgUp.sync(__dirname).pkg },
})

export default plugin
