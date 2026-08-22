import type { ImageMetadata } from 'astro';

export const UPLOADS_PREFIX = '/src/assets/uploads/';

// This pattern MUST stay a string literal. Vite resolves import.meta.glob at
// build time by static analysis and cannot follow a variable or a template
// string, so this is the one place UPLOADS_PREFIX cannot be reused. Keep the
// two in sync by hand if the uploads folder ever moves.
const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true },
);

const STRIP_PREFIX = new RegExp(`^${UPLOADS_PREFIX.slice(1)}`);

/** Turns whatever the CMS stored into a repo-root absolute path. */
export function normaliseUploadPath(value: string): string {
  const trimmed = (value ?? '').trim().replace(/^\.?\//, '');
  return `${UPLOADS_PREFIX}${trimmed.replace(STRIP_PREFIX, '')}`;
}

export function pickImage<T>(map: Record<string, T>, value: string): T {
  const key = normaliseUploadPath(value);
  const found = map[key];
  if (!found) {
    throw new Error(
      `Image not found: ${key.slice(1)}. Open the item in the CMS and upload it again, ` +
        'then save. (The file must live in src/assets/uploads/.)',
    );
  }
  return found;
}

export function resolveUploadedImage(value: string): ImageMetadata {
  return pickImage(uploads, value).default;
}
