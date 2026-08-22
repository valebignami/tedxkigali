import { siteSettings } from '~/lib/settings';

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${siteSettings.siteName} | ${siteSettings.tagline}`;
  return `${pageTitle} | ${siteSettings.siteName}`;
}

export function canonicalUrl(pathname: string, site: URL | undefined): string {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  return site ? new URL(clean, site).toString() : clean;
}

/**
 * Serialises a JSON-LD payload for embedding in a <script> tag.
 *
 * Escaping `<` is the point: every value in these blocks is text an editor
 * typed into the CMS, and a title containing `</script>` would otherwise close
 * the tag early and break the page. Editors cannot be expected to know that.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
