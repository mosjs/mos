const DOUBLE_TILDE = '~~'

export default (compiler, node) => DOUBLE_TILDE + compiler.all(node).join('') + DOUBLE_TILDE
