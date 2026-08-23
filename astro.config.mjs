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
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
