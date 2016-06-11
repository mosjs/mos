export default (compiler, node, parent) => compiler.encode(compiler.escape(node.value, node, parent), node)
