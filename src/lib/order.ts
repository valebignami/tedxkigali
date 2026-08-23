// "Display order" is optional in the CMS. Entries the editor never ordered sort
// after every entry that has a number, instead of jumping to the front as they
// would if an empty field counted as zero.
export const DEFAULT_ORDER = 9999;

/** Comparator for the optional "Display order" field, lowest number first. */
export function compareOrder(a: number | undefined, b: number | undefined): number {
  return (a ?? DEFAULT_ORDER) - (b ?? DEFAULT_ORDER);
}
