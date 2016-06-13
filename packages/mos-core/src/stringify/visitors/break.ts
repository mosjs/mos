import {Visitor} from '../visitor'

const visitor: Visitor = compiler => compiler.options.commonmark ? '\\\n' : '  \n'

export default visitor
