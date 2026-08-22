import { siteSettings } from '~/lib/settings';

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${siteSettings.siteName} | ${siteSettings.tagline}`;
  return `${pageTitle} | ${siteSettings.siteName}`;
}

export function canonicalUrl(pathname: string, site: URL | undefined): string {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  return site ? new URL(clean, site).toString() : clean;
}
