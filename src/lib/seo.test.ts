import { describe, expect, it } from 'vitest';
import { buildPageTitle, canonicalUrl, toJsonLd } from '~/lib/seo';

describe('buildPageTitle', () => {
  it('appends the site name', () => {
    expect(buildPageTitle('Talks')).toBe('Talks | TEDxKigali');
  });

  it('returns the site name and tagline on the home page', () => {
    expect(buildPageTitle()).toBe('TEDxKigali | Ideas worth spreading, from the heart of Rwanda');
  });
});

describe('canonicalUrl', () => {
  const site = new URL('https://tedxkigali.rw');

  it('builds an absolute url', () => {
    expect(canonicalUrl('/talks', site)).toBe('https://tedxkigali.rw/talks');
  });

  it('strips a trailing slash except at the root', () => {
    expect(canonicalUrl('/talks/', site)).toBe('https://tedxkigali.rw/talks');
    expect(canonicalUrl('/', site)).toBe('https://tedxkigali.rw/');
  });

  it('falls back to the pathname when no site is configured', () => {
    expect(canonicalUrl('/talks', undefined)).toBe('/talks');
  });
});

describe('toJsonLd', () => {
  it('serialises a payload', () => {
    expect(toJsonLd({ '@type': 'Event', name: 'Rising' })).toBe('{"@type":"Event","name":"Rising"}');
  });

  it('escapes < so an editor-typed closing tag cannot break out of the script', () => {
    const serialised = toJsonLd({ name: 'Talks </script><img onerror=alert(1)>' });
    expect(serialised).not.toContain('</script>');
    expect(serialised).toContain('\\u003c');
  });

  it('still round-trips to the original value', () => {
    const payload = { name: 'A < B', nested: { url: 'https://example.com' } };
    expect(JSON.parse(toJsonLd(payload))).toEqual(payload);
  });
});
