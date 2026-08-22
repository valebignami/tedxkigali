import { describe, expect, it } from 'vitest';
import { buildPageTitle, canonicalUrl } from '~/lib/seo';

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
