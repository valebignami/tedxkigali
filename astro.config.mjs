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
  integrations: [sitemap(), uploadsAreReadable()],
  vite: { plugins: [tailwindcss()] },
});
