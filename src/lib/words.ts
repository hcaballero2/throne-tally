/** Tidy a typed word: trim, collapse spaces, capitalise the first letter. Empty string if nothing usable. */
export function cleanWord(raw: string): string {
  const w = raw.trim().replace(/\s+/g, ' ').slice(0, 24)
  return w ? w[0]!.toUpperCase() + w.slice(1) : ''
}
