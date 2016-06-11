import m from 'markdownscript'
import reserved from 'reserved-words'

export default function plugin (markdown) {
  const scope = { m }
  Object.keys(m).filter(key => !reserved.check(key, 'next')).forEach(key => { scope[key] = m[key] })
  return scope
}
