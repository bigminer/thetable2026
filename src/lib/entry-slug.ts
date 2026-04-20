export function entrySlug(entry: { slug?: string; id: string }) {
  return String(entry.slug ?? entry.id)
    .replace(/\.md$/i, '')
    .split('/')
    .pop() ?? entry.id.replace(/\.md$/i, '');
}
