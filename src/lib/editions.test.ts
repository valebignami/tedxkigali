import { describe, expect, it } from 'vitest';
import { missingEditionMessage, resolveEditions, type EditionSummary } from '~/lib/editions';

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
