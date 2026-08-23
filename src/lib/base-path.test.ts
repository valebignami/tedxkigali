import { describe, expect, it } from 'vitest';
import { internalHref, withBase } from '~/lib/base-path';

describe('withBase', () => {
  // The sub-path deployment: https://valebignami.github.io/tedxkigali/
  describe('under a sub-path', () => {
    const base = '/tedxkigali';

    it('prefixes a root-relative path', () => {
      expect(withBase('/talks', base)).toBe('/tedxkigali/talks');
    });

    it('keeps the home page addressable', () => {
      expect(withBase('/', base)).toBe('/tedxkigali/');
    });

    it('keeps a fragment attached to its page', () => {
      expect(withBase('/talks#the-hills', base)).toBe('/tedxkigali/talks#the-hills');
    });

    it('prefixes a nested path', () => {
      expect(withBase('/events/tedxkigali-2026', base)).toBe('/tedxkigali/events/tedxkigali-2026');
    });

    it('prefixes a file in public/', () => {
      expect(withBase('/favicon.svg', base)).toBe('/tedxkigali/favicon.svg');
    });
  });

  // BASE_URL carries a trailing slash or not depending on `trailingSlash`, and
  // this project sets 'never'. Both spellings have to give the same href,
  // because a change to that setting must not silently produce `//talks`.
  describe('whatever slashes the base arrives with', () => {
    it('does not double the slash when the base ends with one', () => {
      expect(withBase('/talks', '/tedxkigali/')).toBe('/tedxkigali/talks');
      expect(withBase('/', '/tedxkigali/')).toBe('/tedxkigali/');
    });

    it('never emits a protocol-relative //', () => {
      for (const base of ['/', '', '/tedxkigali', '/tedxkigali/']) {
        expect(withBase('/talks', base)).not.toMatch(/^\/\//);
      }
    });
  });

  // The state the site returns to once it has a domain of its own.
  describe('at the domain root', () => {
    it('leaves a path untouched', () => {
      expect(withBase('/talks', '/')).toBe('/talks');
      expect(withBase('/events/tedxkigali-2026', '/')).toBe('/events/tedxkigali-2026');
    });

    it('leaves the home page as a single slash', () => {
      expect(withBase('/', '/')).toBe('/');
      expect(withBase('/', '')).toBe('/');
    });
  });

  // These are developer mistakes, not editor mistakes, so they throw a plain
  // Error: no volunteer can reach this code from the CMS.
  describe('refuses what it cannot prefix correctly', () => {
    // A bare fragment is relative to the page the visitor is already on.
    // Prefixing it would send "Skip to content" to the home page instead.
    it('rejects a bare fragment', () => {
      expect(() => withBase('#main', '/tedxkigali')).toThrow(/root-relative/);
    });

    it('rejects an absolute url', () => {
      expect(() => withBase('https://example.com/talks', '/tedxkigali')).toThrow(/root-relative/);
      expect(() => withBase('mailto:hello@tedxkigali.rw', '/tedxkigali')).toThrow(/root-relative/);
    });

    it('rejects a relative path', () => {
      expect(() => withBase('talks', '/tedxkigali')).toThrow(/root-relative/);
    });

    // `//talks` is a protocol-relative url pointing at the host "talks".
    it('rejects a path that already starts with two slashes', () => {
      expect(() => withBase('//talks', '/tedxkigali')).toThrow(/root-relative/);
    });
  });
});

describe('internalHref', () => {
  // Vitest builds with no `base`, so BASE_URL is '/' here. What this covers is
  // that the export is wired to import.meta.env at all; the prefixing itself is
  // withBase's, above.
  it('builds an href from the configured base', () => {
    expect(internalHref('/talks')).toBe(withBase('/talks', import.meta.env.BASE_URL));
  });

  it('starts every href at the root', () => {
    for (const path of ['/', '/talks', '/events/tedxkigali-2026', '/favicon.svg']) {
      expect(internalHref(path).startsWith('/')).toBe(true);
      expect(internalHref(path).startsWith('//')).toBe(false);
    }
  });
});
