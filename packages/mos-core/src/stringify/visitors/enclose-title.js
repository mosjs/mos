export default function encloseTitle (title) {
  const delimiter = title.indexOf('"') !== -1 ? "'" : '"'

  return delimiter + title + delimiter
};
