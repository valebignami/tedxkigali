import type { ImageMetadata } from 'astro';
import { editorError } from '~/lib/editor-error';

export const UPLOADS_PREFIX = '/src/assets/uploads/';

// These patterns MUST stay string literals. Vite resolves import.meta.glob at
// build time by static analysis and cannot follow a variable or a template
// string, so this is the one place UPLOADS_PREFIX cannot be reused. Keep them
// in sync by hand if the uploads folder ever moves.
//
// One pattern per file type, with the extension spelled as character classes,
// because the glob matches case-sensitively while the schema accepts any case.
// A photo saved as IMG_1234.JPG — the Android camera, Windows "Save image as"
// and most cameras all produce uppercase — used to pass validation and then be
// missing from this map, and the only advice the build could give was to upload
// the same file again.
const uploads = {
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[jJ][pP][gG]', { eager: true }),
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[jJ][pP][eE][gG]', { eager: true }),
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[pP][nN][gG]', { eager: true }),
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[wW][eE][bB][pP]', { eager: true }),
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[aA][vV][iI][fF]', { eager: true }),
  ...import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.[sS][vV][gG]', { eager: true }),
};

const STRIP_PREFIX = new RegExp(`^${UPLOADS_PREFIX.slice(1)}`);

/** Turns whatever the CMS stored into a repo-root absolute path. */
export function normaliseUploadPath(value: string): string {
  const trimmed = (value ?? '').trim().replace(/^\.?\//, '');
  return `${UPLOADS_PREFIX}${trimmed.replace(STRIP_PREFIX, '')}`;
}

/**
 * Shown when an entry names an image nobody uploaded. It names the file rather
 * than a path under src/, which is a place the editor never sees and cannot act
 * on: the CMS shows them a media library full of file names.
 */
export function imageNotFoundMessage(fileName: string): string {
  return (
    `No image called "${fileName}" has been uploaded. Open the item in the CMS, ` +
    'upload the image again, and save.'
  );
}

export function pickImage<T>(map: Record<string, T>, value: string): T {
  const key = normaliseUploadPath(value);
  const found = map[key];
  if (!found) throw editorError(imageNotFoundMessage(key.slice(UPLOADS_PREFIX.length)));
  return found;
}

export function resolveUploadedImage(value: string): ImageMetadata {
  return pickImage(uploads, value).default;
}
