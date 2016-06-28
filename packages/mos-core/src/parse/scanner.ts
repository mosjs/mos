export type Matcher = {
  (input: string): Boolean
}

export default function createScanner (text: string) {
  let index = 0
  let captures: string[] = []

  function moveIndex(move: number) {
    index += move
  }

  function peek (count?: number): string
  function peek (pattern: RegExp): string
  function peek (pattern: string, limit?: number): string
  function peek (matcher: Matcher): string
  function peek (): string {
    if (arguments.length === 0 || arguments.length === 1 && typeof arguments[0] === 'number') {
      const count = arguments.length === 0 ? 1 : arguments[0]
      if (count === 1) {
        return text.charAt(index)
      }
      return text.substr(0, count)
    }
    if (arguments[0] instanceof RegExp) {
      const pattern = arguments[0]
      const matches = pattern.exec(text.substr(index))
      if (matches && matches.index === 0) {
        captures = matches.slice(1)
        return matches[0]
      }
      captures = []
    }
    if (typeof arguments[0] === 'string') {
      let result = ''
      let localIndex = index
      let findingsCount = 0
      const limit = typeof arguments[1] === 'number' ? arguments[1] : text.length
      while (arguments[0] === text.charAt(localIndex) && ++findingsCount <= limit) {
        result += text.charAt(localIndex)
        localIndex++
      }
      return result === '' ? null : result
    }
    if (typeof arguments[0] === 'function') {
      let result = ''
      let localIndex = index
      while (arguments[0](text.charAt(localIndex)) === true) {
        result += text.charAt(localIndex)
        localIndex++
      }
      return result === '' ? null : result
    }
    return null
  }

  function untilIndexOf (pattern: string | RegExp): number {
    if (typeof pattern === 'string') {
      return text.indexOf(pattern, index)
    }
    const matches = (<RegExp>pattern).exec(text.substr(index))
    return matches && matches.index || -1
  }

  function nextUntil (pattern: string | RegExp): string {
    const untilIndex = untilIndexOf(pattern)
    return untilIndex === -1 ? rest() : next(untilIndex - index)
  }

  function rest (): string {
    return next(text.length - index)
  }

  function next (count?: number): string
  function next (pattern: RegExp): string
  function next (pattern: string, limit?: number): string
  function next (matcher: Matcher): string
  function next () {
    const result = peek.apply(null, arguments)
    if (result !== null) {
      moveIndex(result.length)
    }
    return result
  }

  return {
    getCapture (index: number): string {
      return captures[index]
    },
    peek,
    next,
    nextUntil,
    eos (): boolean {
      return index === text.length
    },
    moveIndex,
    getIndex (): number {
      return index
    },
    setIndex (newIndex: number): void {
      index = newIndex
    },
    rest,
  }
}
