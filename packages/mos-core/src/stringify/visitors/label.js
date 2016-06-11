export default function label (node) {
  let value = ''

  if (node.referenceType === 'full') {
    value = node.identifier
  }

  if (node.referenceType !== 'shortcut') {
    value = `[${value}]`
  }

  return value
};
