import type { ImageMetadata } from 'astro';

export const UPLOADS_PREFIX = '/src/assets/uploads/';

const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true },
);

/** Turns whatever the CMS stored into a repo-root absolute path. */
export function normaliseUploadPath(value: string): string {
  const trimmed = (value ?? '').trim().replace(/^\.?\//, '');
  const withoutPrefix = trimmed.replace(/^src\/assets\/uploads\//, '');
  return `${UPLOADS_PREFIX}${withoutPrefix}`;
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
