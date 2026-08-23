import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // The second pattern is the one script the workflow runs that is not part
    // of the site: .github/scripts/publish-notice.mjs, which reads a failed
    // build's log and writes the issue the editor is told through. It is plain
    // JavaScript because the runner calls it with bare `node`, and it is tested
    // here so that `npm test` covers the half of the gate that speaks.
    include: ['src/**/*.test.ts', '.github/scripts/*.test.mjs'],
    environment: 'node',
  },
});
