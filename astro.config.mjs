import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { editorError } from './src/lib/editor-error.ts';
import { notAnImageMessage, unreadableUploads } from './src/lib/image-files.ts';

const UPLOADS_DIR = 'src/assets/uploads';

// This has to be an integration rather than anything inside src/: the failure
// it heads off happens while Vite transforms the module that lists the uploads,
// which is earlier than any page, any collection and any code of ours. Only a
// hook that runs before the build starts gets there first.
const uploadsAreReadable = () => ({
  name: 'tedxkigali:uploads-are-readable',
  hooks: {
    'astro:build:start': () => {
      const broken = unreadableUploads(UPLOADS_DIR);
      if (broken.length > 0) throw editorError(notAnImageMessage(broken[0]));
    },
  },
});

// Where the site is published, as one url. This is the only line to change to
// move it: `site` and `base` below are both read off it, and so are the
// canonical links, the sitemap and robots.txt, which take them from here.
//
// The site currently lives on GitHub Pages as a project site, so it is served
// from a sub-path rather than from the root of a domain. When the real domain
// is ready, replace the line below with
//
//     const PUBLISHED_AT = new URL('https://tedxkigali.rw/');
//
// and nothing else: the pathname of that url is '/', which makes `base` the '/'
// that means "no sub-path", and every internal link follows.
const PUBLISHED_AT = new URL('https://valebignami.github.io/tedxkigali/');

export default defineConfig({
  site: PUBLISHED_AT.origin,
  base: PUBLISHED_AT.pathname,
  output: 'static',
  // The canonical link in BaseLayout emits /talks, so the sitemap must not
  // emit /talks/: two spellings of one page is a duplicate-content signal.
  // @astrojs/sitemap has no option of its own for this — it reads the project
  // setting below. The pages are still written as directories with an
  // index.html, so nothing about hosting changes.
  //
  // It has a second effect that this project depends on, and it is not in the
  // name: Astro derives import.meta.env.BASE_URL from this setting, so with
  // 'never' the base above arrives at src/lib/base-path.ts as "/tedxkigali"
  // with no trailing slash, and with 'always' it would arrive as
  // "/tedxkigali/". withBase there is written to take either, so changing this
  // line cannot start producing "//talks".
  //
  // A note about the home page, checked against the built output rather than
  // assumed. The sitemap integration strips the trailing slash from its root
  // entry, and while the site is served from a sub-path the canonical link
  // loses it too — the pathname it is built from is "/tedxkigali/", which is
  // not "/", so canonicalUrl trims it. Both therefore say
  // https://valebignami.github.io/tedxkigali and there is nothing to
  // reconcile. That agreement is an accident of the sub-path: the day
  // PUBLISHED_AT becomes a bare domain, the home page's pathname is "/" again,
  // canonicalUrl keeps that slash by design and the sitemap will go on
  // stripping it. The two spellings are the same URL — RFC 3986 makes an empty
  // path equivalent to "/" for http and https, and every crawler normalises
  // them — so that is a difference to leave alone, not a regression to chase.
  trailingSlash: 'never',
  integrations: [
    // /admin is a redirect to the editing screen, not a page of the site. It
    // carries noindex too; keeping it out of the sitemap stops the two from
    // contradicting each other, which is a Search Console warning.
    sitemap({ filter: (page) => !page.endsWith('/admin') }),
    uploadsAreReadable(),
  ],
  vite: { plugins: [tailwindcss()] },
});
