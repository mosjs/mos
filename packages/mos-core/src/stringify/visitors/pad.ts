const INDENT = 4

export default function pad (value: string, level: number): string {
  const lines = value.split('\n')

  let index = lines.length
  const padding = ' '.repeat(level * INDENT)

  while (index--) {
    if (lines[index].length !== 0) {
      lines[index] = padding + lines[index]
    }
  }

  return lines.join('\n')
};
