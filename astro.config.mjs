import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Replace with the final domain before the first production deploy (Task 18).
  site: 'https://tedxkigali.rw',
  output: 'static',
  // The canonical link in BaseLayout emits /talks, so the sitemap must not
  // emit /talks/: two spellings of one page is a duplicate-content signal.
  // @astrojs/sitemap has no option of its own for this — it reads the project
  // setting below. The pages are still written as directories with an
  // index.html, so nothing about hosting changes.
  //
  // One consequence looks like a defect and is not. This setting also strips
  // the slash from the root, so the sitemap lists the home page as
  // https://tedxkigali.rw while its canonical says https://tedxkigali.rw/.
  // Those are the same URL: RFC 3986 makes an empty path equivalent to "/" for
  // http and https, and every crawler normalises them. It is also not fixable
  // from here — the sitemap integration applies this setting after its own
  // serialize hook runs, so a hook receives the slash and cannot keep it.
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
