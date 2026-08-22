import { describe, expect, it } from 'vitest';
import { normaliseUploadPath, pickImage, UPLOADS_PREFIX } from '~/lib/images';

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
});

describe('pickImage', () => {
  const map = { [`${UPLOADS_PREFIX}hero.jpg`]: 'HERO_ASSET' };

  it('returns the matching asset', () => {
    expect(pickImage(map, 'src/assets/uploads/hero.jpg')).toBe('HERO_ASSET');
  });

  it('throws an editor-friendly error when the file is missing', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrowError(
      /Image not found: src\/assets\/uploads\/missing\.jpg/,
    );
  });

  it('mentions how to fix the problem', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrowError(/upload it again/i);
  });
});
