export default function encloseTitle (title: string): string {
  const delimiter = title.indexOf('"') !== -1 ? "'" : '"'

  return delimiter + title + delimiter
};
