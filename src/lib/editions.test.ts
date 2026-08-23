import { describe, expect, it } from 'vitest';
import {
  hiddenEditionMessage,
  missingEditionMessage,
  resolveEditions,
  type EditionSummary,
} from '~/lib/editions';

const editions: EditionSummary[] = [
  { id: 'tedxkigali-2024', title: 'TEDxKigali 2024 — Threads', startDate: new Date('2024-09-21T09:00:00+02:00') },
  { id: 'tedxkigali-2025', title: 'TEDxKigali 2025 — Roots', startDate: new Date('2025-10-18T09:00:00+02:00') },
];

describe('resolveEditions', () => {
  it('maps every edition to its title', () => {
    const { titleById } = resolveEditions([], editions);
    expect(titleById.get('tedxkigali-2025')).toBe('TEDxKigali 2025 — Roots');
  });

  it('returns only the editions a talk belongs to', () => {
    const { used } = resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2024' }], editions);
    expect(used.map((edition) => edition.id)).toEqual(['tedxkigali-2024']);
  });

  it('ignores talks with no edition', () => {
    const { used } = resolveEditions([{ title: 'A talk' }], editions);
    expect(used).toEqual([]);
  });

  // The filter buttons used to sort by title, which is only chronological
  // while every title happens to begin with the year.
  it('sorts the used editions by date, newest first', () => {
    const dated: EditionSummary[] = [
      { id: 'later', title: 'Alpha', startDate: new Date('2026-11-14T09:00:00+02:00') },
      { id: 'earlier', title: 'Zulu', startDate: new Date('2023-11-14T09:00:00+02:00') },
    ];
    const { used } = resolveEditions(
      [{ title: 'X', editionId: 'earlier' }, { title: 'Y', editionId: 'later' }],
      dated,
    );
    expect(used.map((edition) => edition.id)).toEqual(['later', 'earlier']);
  });

  // What the CMS writes. `value: '{name}'` in .pages.yml stores the file name,
  // extension and all, and the site looks an event up by its id — see
  // src/lib/stored-reference.ts. Both spellings are in the repository today.
  it('resolves an edition stored as a file name, exactly like a bare id', () => {
    const fromCms = resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2024.md' }], editions);
    const byHand = resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2024' }], editions);
    expect(fromCms.used.map((edition) => edition.id)).toEqual(['tedxkigali-2024']);
    expect(fromCms.used).toEqual(byHand.used);
  });

  it('resolves an edition stored as a whole path', () => {
    const { used } = resolveEditions(
      [{ title: 'A talk', editionId: 'src/content/events/tedxkigali-2024.md' }],
      editions,
    );
    expect(used.map((edition) => edition.id)).toEqual(['tedxkigali-2024']);
  });

  // Astro slugifies ids to lower case, so an event renamed to "Tedxkigali-2024"
  // still has the id below and the reference still means it.
  it('resolves an edition stored with capitals in it', () => {
    const { used } = resolveEditions([{ title: 'A talk', editionId: 'TEDxKigali-2024.md' }], editions);
    expect(used.map((edition) => edition.id)).toEqual(['tedxkigali-2024']);
  });

  it('treats an edition of nothing but spaces as no edition at all', () => {
    const { used } = resolveEditions([{ title: 'A talk', editionId: '   ' }], editions);
    expect(used).toEqual([]);
  });

  // Normalising must not soften the guard: a reference to an event that is not
  // there still has to stop the build.
  it('throws when the file name stored has no event behind it', () => {
    expect(() =>
      resolveEditions([{ title: 'The market at dawn', editionId: 'tedxkigali-2027.md' }], editions),
    ).toThrow(/tedxkigali-2027\.md/);
  });

  // The volunteer is answered with the value that is actually written in their
  // talk, not with the id the site derived from it: "tedxkigali-2027.md" is the
  // string they, or the maintainer the message sends them to, can go and find.
  it('quotes the value as it was stored, not the id looked up', () => {
    expect(() =>
      resolveEditions([{ title: 'The market at dawn', editionId: 'tedxkigali-2027.md' }], editions),
    ).toThrow(missingEditionMessage('The market at dawn', 'tedxkigali-2027.md'));
  });

  // The hidden-event message is found through the normalised id too, or a talk
  // filed from the CMS under a hidden event would fall through to the general
  // message and be told to re-pick an edition that is still right there.
  it('names a hidden edition by title even when the file name was stored', () => {
    const published = editions.filter((edition) => edition.id !== 'tedxkigali-2025');
    const allTitles = new Map(editions.map((edition) => [edition.id, edition.title]));
    expect(() =>
      resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2025.md' }], published, allTitles),
    ).toThrow(/TEDxKigali 2025 — Roots/);
  });

  it('throws when the edition does not exist', () => {
    expect(() =>
      resolveEditions([{ title: 'The market at dawn', editionId: 'tedxkigali-2027' }], editions),
    ).toThrow(missingEditionMessage('The market at dawn', 'tedxkigali-2027'));
  });

  // A hidden event is absent from the list the caller passes in, so the same
  // guard covers it: the page it would link to was never built either.
  it('throws when the edition is hidden', () => {
    const published = editions.filter((edition) => edition.id !== 'tedxkigali-2025');
    expect(() => resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2025' }], published)).toThrow(
      /make it visible again/i,
    );
  });

  // The hidden event is still in the CMS, under a name the volunteer chose, so
  // there is no reason to answer them with the stored id.
  it('names a hidden edition by its title when the caller can supply one', () => {
    const published = editions.filter((edition) => edition.id !== 'tedxkigali-2025');
    const allTitles = new Map(editions.map((edition) => [edition.id, edition.title]));
    expect(() =>
      resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2025' }], published, allTitles),
    ).toThrow(/TEDxKigali 2025 — Roots/);
  });

  // A deleted or renamed event has no title anywhere, so the stored id is the
  // only thing left to quote and the general message still has to serve.
  it('falls back to the stored id when no title is known for it', () => {
    const allTitles = new Map(editions.map((edition) => [edition.id, edition.title]));
    expect(() =>
      resolveEditions([{ title: 'A talk', editionId: 'tedxkigali-2027' }], editions, allTitles),
    ).toThrow(/tedxkigali-2027/);
  });
});

describe('hiddenEditionMessage', () => {
  const message = hiddenEditionMessage('The market at dawn', 'TEDxKigali 2025 — Roots');

  it('names the talk and the edition the way the CMS lists them', () => {
    expect(message).toContain('The market at dawn');
    expect(message).toContain('TEDxKigali 2025 — Roots');
    expect(message).not.toMatch(/tedxkigali-2025"/);
  });

  it('offers un-hiding the event and hiding the talk, and nothing that loses the facts', () => {
    expect(message).toMatch(/hidden/i);
    expect(message).toMatch(/hide this talk/i);
    expect(message).not.toMatch(/pick the edition again/i);
  });
});

describe('missingEditionMessage', () => {
  const message = missingEditionMessage('The market at dawn', 'tedxkigali-2027');

  // The talk used to be named by its file name, which no list in the CMS shows.
  it('names the talk by its title, and quotes what was stored for the edition', () => {
    expect(message).toContain('The market at dawn');
    expect(message).toContain('tedxkigali-2027');
    expect(message).not.toMatch(/reference|zod|undefined/i);
  });

  // The hidden-event case is the one the editing guide sends volunteers into,
  // and re-pointing the talk is the wrong remedy for it: it would publish the
  // talk under an edition it was never filmed at, with a green build. The
  // message has to offer the two remedies that keep the facts intact.
  it('offers making the event visible again and hiding the talk, not only re-pointing it', () => {
    expect(message).toMatch(/visible again/i);
    expect(message).toMatch(/hide this talk/i);
    expect(message).toMatch(/pick the edition again/i);
  });

  // The event can be there, and visible, and still not be found — the CMS may
  // store a name the website does not look entries up by. Saying it "does not
  // exist or is hidden" was then flatly untrue, and all three remedies failed.
  it('claims nothing about the event existing, and has an answer when re-picking fails', () => {
    expect(message).not.toMatch(/does not exist/i);
    expect(message).toMatch(/keeps happening/i);
    expect(message).toMatch(/maintainer/i);
  });
});
