import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { referencedId } from '~/lib/stored-reference';

describe('referencedId', () => {
  // The bare id is what every file written by hand before the CMS existed
  // holds, and those files are still in the repository.
  it('leaves a bare id alone', () => {
    expect(referencedId('tedxkigali-2026')).toBe('tedxkigali-2026');
  });

  // The defect this exists for: the first real Pages CMS session, on
  // 23 August 2026, stored `edition: test.md` for the event whose id is `test`.
  it('drops the extension the CMS writes', () => {
    expect(referencedId('test.md')).toBe('test');
    expect(referencedId('tedxkigali-2026.md')).toBe('tedxkigali-2026');
  });

  it('drops every extension a content entry in this project could carry', () => {
    for (const extension of ['md', 'mdx', 'markdown', 'json', 'yaml', 'yml', 'toml']) {
      expect(referencedId(`test.${extension}`)).toBe('test');
    }
  });

  // Only the last extension goes. Everything before it is the file name, and
  // guessing at a shorter one would be inventing a reference nobody stored.
  it('drops only the last extension', () => {
    expect(referencedId('notes.draft.md')).toBe('notes.draft');
  });

  // {path} is the other token the reference field offers, and it writes the
  // whole path from the repository root.
  it('drops the collection folder a path token would carry', () => {
    expect(referencedId('src/content/events/test.md')).toBe('test');
    expect(referencedId('./src/content/talks/test-talk.md')).toBe('test-talk');
    expect(referencedId('src\\content\\events\\test.md')).toBe('test');
  });

  // An entry stored one folder further down keeps that folder in its Astro id,
  // so the folder has to survive: dropping every directory part would break a
  // reference that resolves correctly today.
  it('keeps a folder inside the collection, which is part of the id', () => {
    expect(referencedId('src/content/talks/2025/the-hills.md')).toBe('2025/the-hills');
    expect(referencedId('2025/the-hills')).toBe('2025/the-hills');
  });

  // Astro slugifies every id to lower case, so an upper-case reference can only
  // ever have been meant for the lower-case entry.
  it('lowercases, because an id never has an upper-case letter in it', () => {
    expect(referencedId('Test.md')).toBe('test');
    expect(referencedId('TEDxKigali-2026')).toBe('tedxkigali-2026');
  });

  it('treats nothing, and nothing but spaces, as no reference at all', () => {
    expect(referencedId(undefined)).toBeUndefined();
    expect(referencedId(null)).toBeUndefined();
    expect(referencedId('')).toBeUndefined();
    expect(referencedId('   ')).toBeUndefined();
    expect(referencedId('.md')).toBeUndefined();
  });

  it('ignores the spaces around a value typed by hand', () => {
    expect(referencedId('  tedxkigali-2026.md  ')).toBe('tedxkigali-2026');
  });
});

// The content on disk, held to the shape the CMS writes.
//
// referencedId() takes either form and the site builds the same page from both,
// so nothing here is about the website. It is about the form: Pages CMS matches
// a reference against its own list of options, whose values are file names with
// the extension on them. A file written by hand with the bare id matches
// nothing, so the field shows that id in place of the title the volunteer would
// have picked — "tedxkigali-women-2025" where the help text says to pick
// "TEDxKigali Women 2025 — In the Room" from a list. Every talk and every
// speaker on the site read like that until 23 August 2026.
describe('the references stored in the content', () => {
  const stored = (dir: string, key: string): Array<[string, string]> => {
    const pattern = new RegExp('^' + key + ': "([^"]+)"$', 'm');
    const out: Array<[string, string]> = [];
    for (const file of readdirSync('src/content/' + dir)) {
      const found = readFileSync('src/content/' + dir + '/' + file, 'utf8').match(pattern);
      if (found) out.push([dir + '/' + file, found[1]]);
    }
    return out;
  };

  it('name a file the way the CMS names one, extension and all', () => {
    const entries = [...stored('talks', 'edition'), ...stored('speakers', 'talk')];
    expect(entries.length).toBeGreaterThan(0);
    for (const [file, value] of entries) {
      expect(file + ': ' + value).toBe(file + ': ' + referencedId(value) + '.md');
    }
  });
});
