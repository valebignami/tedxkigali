// The one place a stored reference is turned into the id the site looks an
// entry up by. Every resolution point calls this — src/lib/editions.ts,
// src/pages/talks.astro, src/pages/events/[slug].astro, src/pages/speakers.astro
// and src/components/TalkCard.astro — because the CMS and the repository spell
// the same reference two different ways and both have to reach the same entry.
//
// What the CMS spells: the first real Pages CMS session, on 23 August 2026,
// created an event whose file is src/content/events/test.md — Astro id `test` —
// and a talk pointing at it. The talk was written with `edition: test.md`. The
// field is declared in .pages.yml with `value: '{name}'`, and this is what
// {name} yields: the file name, extension and all.
//
// Why the CMS is not simply told to write the id instead: the reference field's
// value option takes {path}, {name}, {primary}, {fields.<path>} and the
// {<path>} shorthand for the last of those (pagescms.org/docs/configuration/
// fields/reference/, read 23 August 2026), and not one of them yields the file
// name without its extension. So the site accepts the file name.
//
// Why the repository spells it the other way: the events and talks written by
// hand before the CMS was connected hold the bare id — `edition:
// tedxkigali-2025` — and they are still here. Neither spelling may ever stop
// working, so nothing about this is a migration.

/**
 * The collection folder in front of an entry, which a {path} token carries and
 * an id does not. Only this much of the path goes: a folder *inside* the
 * collection stays, because the glob loader puts it in the id — a talk at
 * src/content/talks/2025/x.md has the id `2025/x`, so dropping every directory
 * part would break a reference that resolves today.
 */
const COLLECTION_FOLDER = /^.*?src\/content\/[^/]+\//;

/**
 * The extensions a content entry in an Astro collection can carry. `.md` is the
 * only one Astro's built-in content entry type accepts, and `.json`, `.yaml`,
 * `.yml` and `.toml` are its built-in data ones; `.mdx` and `.markdown` are
 * here because installing an integration is exactly the kind of change nobody
 * would think to re-check this against.
 */
const ENTRY_EXTENSION = /\.(?:md|mdx|markdown|json|yaml|yml|toml)$/;

/**
 * The id to look up for a reference as it was stored, or undefined when nothing
 * was stored at all.
 *
 * Callers keep the stored value for the message they show when the lookup
 * fails: that value is the only one written anywhere the volunteer or the
 * maintainer can go and find it.
 */
export function referencedId(stored: string | null | undefined): string | undefined {
  const cleaned = (stored ?? '')
    .trim()
    .replace(/\\/g, '/')
    // Astro slugifies every id to lower case (github-slugger, through the glob
    // loader), so an id with a capital in it does not exist and a reference
    // carrying one can only have been meant for the lower-case entry. This is
    // the path a volunteer renaming an entry takes, and lowercasing cannot make
    // two entries collide here that Astro has not already collided: it gives
    // Test.md and test.md the one id `test` either way.
    .toLowerCase()
    .replace(COLLECTION_FOLDER, '')
    .replace(ENTRY_EXTENSION, '');
  return cleaned === '' ? undefined : cleaned;
}
