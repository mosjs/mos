import {Node, Location} from '../../../node'
import {Parser} from '../../parser'

/**
 * Create a link node.
 *
 * @example
 *   renderLink(true, 'example.com', 'example', 'Example Domain', now(), eat)
 *   renderLink(false, 'fav.ico', 'example', 'Example Domain', now(), eat)
 *
 * @param {string} url - URI reference.
 * @param {string} text - Content.
 * @param {string?} title - Title.
 * @param {Object} position - Location of link.
 * @return {Object} - `link` or `image` node.
 */
export default function renderLink (parser: Parser, url: string, text: string, title?: string, position?: Location): Promise<Node> {
  const exitLink = parser.state.enterLink()

  return parser.tokenizeInline(text, position)
    .then(children => {
      exitLink()
      return <Node>{
        type: 'link',
        title: title || null,
        children,
        url
      }
    })
}
