export default function removeLastEOL (text) {
  return text.replace(/\r?\n\s*$/, '')
}
