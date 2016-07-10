export default function removeLastEOL (text: string): string {
  return text.replace(/\r?\n\s*$/, '')
}
