/** True when every word of the query appears in the text (case-insensitive). */
export function matches(query: string, ...texts: string[]): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = texts.join(' ').toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/** Puts results whose name matches the query first. */
export function byRelevance<T extends { name: string }>(query: string, items: T[]): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const score = (item: T) => words.filter((word) => item.name.toLowerCase().includes(word)).length;
  return [...items].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}
