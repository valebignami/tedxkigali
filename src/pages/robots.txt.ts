import type { APIRoute } from 'astro';
import { internalHref } from '~/lib/base-path';

// Generated rather than kept in public/, because the one thing it says besides
// "come in" is where the sitemap is, and that url has to carry the deployment
// base. A static file would be a second place holding the published address,
// and the two would drift the first time the site moves.
//
// A caveat that is not a defect and cannot be fixed from here: while the site
// is a GitHub Pages *project* site, crawlers look for robots.txt at
// valebignami.github.io/robots.txt — the root of the domain, which belongs to
// the account, not to this repository. This file is served at
// /tedxkigali/robots.txt and no crawler will read it there. It is written
// correctly anyway, so that it is already right the day the site moves to a
// domain of its own, where it will be read.
export const GET: APIRoute = ({ site }) => {
  const sitemap = site ? new URL(internalHref('/sitemap-index.xml'), site).toString() : undefined;

  const body = ['User-agent: *', 'Allow: /', ...(sitemap ? ['', `Sitemap: ${sitemap}`] : []), ''].join(
    '\n',
  );

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
