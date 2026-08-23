/**
 * A text with a full stop at the end, unless it ends itself already.
 *
 * The About page prints "Meaning of the x" inside a sentence of its own and has
 * to close it. The value in the CMS today has no full stop, so the page adds
 * one — but nothing in the form says so, and a volunteer who writes a whole
 * sentence, full stop included, would get two of them.
 */
export function withFullStop(text: string): string {
  const trimmed = text.trim();
  if (trimmed === '') return '';
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
