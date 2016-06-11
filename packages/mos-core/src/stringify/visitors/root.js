import block from './block'
export default (compiler, node) => `${block(compiler, node)}\n`
