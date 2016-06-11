export default (compiler, node) => {
  const marker = compiler.options.emphasis

  return marker + compiler.all(node).join('') + marker
}
