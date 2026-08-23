import { describe, expect, it } from 'vitest';
import { missingTalkMessage, speakerTalkLink, TALKS_ARCHIVE_HREF } from '~/lib/speaker-talk';

const published = { id: 'the-hills-that-listen', draft: false };
const hidden = { id: 'a-quiet-year', draft: true };
const talks = new Map([
  [published.id, published],
  [hidden.id, hidden],
]);

describe('speakerTalkLink', () => {
  it('points at the talk card when the talk is published', () => {
    expect(speakerTalkLink('Aline Uwase', 'the-hills-that-listen', talks)).toEqual({
      href: `${TALKS_ARCHIVE_HREF}#the-hills-that-listen`,
    });
  });

  // No button at all, rather than one pointing at the archive: a speaker can be
  // on the site before their talk is filmed, and "Watch the talk" landing on a
  // list of other people's talks is a promise the card cannot keep.
  it('gives no link at all when no talk was chosen', () => {
    expect(speakerTalkLink('Aline Uwase', undefined, talks)).toEqual({});
  });

  // "Hide from the website" is documented as safe, so a hidden talk has to keep
  // building: it simply has no card of its own to point at.
  it('points at the archive when the talk is hidden', () => {
    expect(speakerTalkLink('Aline Uwase', 'a-quiet-year', talks)).toEqual({ href: TALKS_ARCHIVE_HREF });
  });

  // This used to log one line and finish the build with exit 0, so the site
  // published a speaker whose talk link went nowhere and nobody was told.
  it('stops the build when the talk was deleted', () => {
    expect(() => speakerTalkLink('Aline Uwase', 'a-talk-that-was-deleted', talks)).toThrow(
      missingTalkMessage('Aline Uwase', 'a-talk-that-was-deleted'),
    );
  });

  // The "Their talk" field is a reference field with `value: '{name}'`, exactly
  // like a talk's edition, so it stores the file name and has the same defect.
  // Nobody had exercised it in the CMS when this was fixed; the edition field's
  // first real use is what proved what {name} writes.
  it('finds the talk when the CMS stored the file name', () => {
    expect(speakerTalkLink('Aline Uwase', 'the-hills-that-listen.md', talks)).toEqual({
      href: `${TALKS_ARCHIVE_HREF}#the-hills-that-listen`,
    });
  });

  it('finds the talk when a whole path, or a capital, was stored', () => {
    expect(speakerTalkLink('Aline Uwase', 'src/content/talks/the-hills-that-listen.md', talks)).toEqual({
      href: `${TALKS_ARCHIVE_HREF}#the-hills-that-listen`,
    });
    expect(speakerTalkLink('Aline Uwase', 'The-Hills-That-Listen.md', talks)).toEqual({
      href: `${TALKS_ARCHIVE_HREF}#the-hills-that-listen`,
    });
  });

  it('still points at the archive for a hidden talk stored as a file name', () => {
    expect(speakerTalkLink('Aline Uwase', 'a-quiet-year.md', talks)).toEqual({ href: TALKS_ARCHIVE_HREF });
  });

  // Normalising must not soften the guard.
  it('stops the build for a file name with no talk behind it', () => {
    expect(() => speakerTalkLink('Aline Uwase', 'deleted-talk.md', talks)).toThrow(
      missingTalkMessage('Aline Uwase', 'deleted-talk.md'),
    );
  });

  it('treats a field holding nothing but spaces as no talk chosen', () => {
    expect(speakerTalkLink('Aline Uwase', '   ', talks)).toEqual({});
  });
});

describe('missingTalkMessage', () => {
  const message = missingTalkMessage('Aline Uwase', 'the-hills-that-listen');

  it('names the speaker the way the CMS lists them', () => {
    expect(message).toContain('Aline Uwase');
    expect(message).toContain('the-hills-that-listen');
  });

  it('gives an answer for deleting on purpose and for deleting by mistake', () => {
    expect(message).toMatch(/"Their talk"/);
    expect(message).toMatch(/add the talk back/i);
    expect(message).not.toMatch(/reference|collection|zod|undefined/i);
  });
});

// The three answers are different on purpose, and this is the test that says so
// in one place: the first speaker added with no talk got the hidden-talk answer
// and shipped a "Watch the talk" button that landed on a list of other people's
// talks.
describe('the three answers are told apart', () => {
  it('gives a card link, an archive link and no link at all', () => {
    expect(speakerTalkLink('Aline Uwase', 'the-hills-that-listen', talks).href).toBe(
      `${TALKS_ARCHIVE_HREF}#the-hills-that-listen`,
    );
    expect(speakerTalkLink('Aline Uwase', 'a-quiet-year', talks).href).toBe(TALKS_ARCHIVE_HREF);
    expect(speakerTalkLink('Aline Uwase', undefined, talks).href).toBeUndefined();
  });
});
