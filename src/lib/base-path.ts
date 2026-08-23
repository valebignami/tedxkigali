// The site is published under a sub-path — https://valebignami.github.io/tedxkigali/ —
// and every internal link in this project is written from the root: "/talks",
// "/events/…", "/favicon.svg". Astro's `base` option does not touch those: it
// rewrites the paths it generates itself (page routes, bundled assets), not
// string literals in our markup. Left alone they would point at
// valebignami.github.io/talks, which is somebody else's page.
//
// So every hand-written internal link goes through here, and nowhere else
// reads import.meta.env.BASE_URL. One place to look when the deployment moves,
// and one place where the slash arithmetic below is written down.

/** Thrown for a path this cannot prefix. See withBase. */
function notRootRelative(path: string): Error {
  return new Error(
    `internalHref expects a root-relative path starting with a single "/", got ${JSON.stringify(path)}. ` +
      'External urls, mailto: links and bare "#fragment" links must be written as they are — ' +
      'a fragment in particular is relative to the page the visitor is already on, and prefixing ' +
      'it would turn it into a link to a different page.',
  );
}

/**
 * Prefixes a root-relative path with a deployment base.
 *
 * Split from internalHref so the slash arithmetic is testable against every
 * base this project can be configured with, not only the one it is built with.
 *
 * The base arrives in two spellings and both have to work. Astro derives
 * import.meta.env.BASE_URL from `trailingSlash`: with 'never' — what this
 * project sets — `base: '/tedxkigali'` becomes "/tedxkigali", and with 'always'
 * the same setting becomes "/tedxkigali/". Trimming one trailing slash and
 * relying on the path to bring its own is what makes both give "/tedxkigali/talks"
 * rather than "/tedxkigali//talks" for one of them.
 */
export function withBase(path: string, base: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw notRootRelative(path);
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${prefix}${path}`;
}

/** The href for a root-relative internal path, under wherever the site is deployed. */
export function internalHref(path: string): string {
  return withBase(path, import.meta.env.BASE_URL);
}
