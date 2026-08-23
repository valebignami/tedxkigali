import { describe, expect, it } from 'vitest';
import { imageNotFoundMessage, normaliseUploadPath, pickImage, UPLOADS_PREFIX } from '~/lib/images';

describe('normaliseUploadPath', () => {
  it.each([
    'src/assets/uploads/hero.jpg',
    '/src/assets/uploads/hero.jpg',
    './src/assets/uploads/hero.jpg',
    'hero.jpg',
    '/hero.jpg',
    '  src/assets/uploads/hero.jpg  ',
  ])('normalises %s', (input) => {
    expect(normaliseUploadPath(input)).toBe(`${UPLOADS_PREFIX}hero.jpg`);
  });

  it('keeps sub-folders', () => {
    expect(normaliseUploadPath('src/assets/uploads/2026/hero.jpg')).toBe(
      `${UPLOADS_PREFIX}2026/hero.jpg`,
    );
  });

  // The extension is left exactly as the editor's file spells it: the lookup
  // map is built from the real file names, which are as often IMG_1234.JPG as
  // img_1234.jpg.
  it('keeps the case of the file name', () => {
    expect(normaliseUploadPath('PHOTO-2026.JPG')).toBe(`${UPLOADS_PREFIX}PHOTO-2026.JPG`);
  });
});

describe('pickImage', () => {
  const map = { [`${UPLOADS_PREFIX}hero.jpg`]: 'HERO_ASSET', [`${UPLOADS_PREFIX}IMG_1.JPG`]: 'UPPER_ASSET' };

  it('returns the matching asset', () => {
    expect(pickImage(map, 'src/assets/uploads/hero.jpg')).toBe('HERO_ASSET');
  });

  it('returns an asset whose extension is uppercase', () => {
    expect(pickImage(map, 'src/assets/uploads/IMG_1.JPG')).toBe('UPPER_ASSET');
  });

  it('throws an editor-friendly error when the file is missing', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrow(imageNotFoundMessage('missing.jpg'));
  });

  it('names the file the editor uploaded, not a folder under src', () => {
    expect(() => pickImage(map, 'src/assets/uploads/missing.jpg')).toThrow(/"missing\.jpg"/);
    expect(() => pickImage(map, 'src/assets/uploads/missing.jpg')).not.toThrow(/src\//);
  });

  it('mentions how to fix the problem', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrow(/upload the image again/i);
  });
});
