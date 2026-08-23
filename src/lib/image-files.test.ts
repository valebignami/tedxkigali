import { describe, expect, it } from 'vitest';
import { looksLikeImage, notAnImageMessage } from '~/lib/image-files';

const head = (...parts: Array<number[] | string>) => {
  const bytes: number[] = [];
  for (const part of parts) {
    if (typeof part === 'string') bytes.push(...[...part].map((c) => c.charCodeAt(0)));
    else bytes.push(...part);
  }
  return new Uint8Array([...bytes, ...new Array(Math.max(0, 16 - bytes.length)).fill(0)]);
};

describe('looksLikeImage', () => {
  it.each([
    ['a JPEG', head([0xff, 0xd8, 0xff, 0xe0])],
    ['a PNG', head([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    ['a WEBP', head('RIFF', [0x20, 0x00, 0x00, 0x00], 'WEBP')],
    ['an AVIF', head([0x00, 0x00, 0x00, 0x20], 'ftypavif')],
    ['an SVG', head('<svg xmlns="htt')],
    ['an SVG with an XML declaration', head('<?xml version=')],
    ['an SVG that opens with a comment', head('<!-- Acme logo')],
    ['an SVG with a blank line first', head('\n  <svg xmlns=')],
  ])('accepts %s', (_what, bytes) => {
    expect(looksLikeImage(bytes)).toBe(true);
  });

  it.each([
    ['a text file somebody renamed', head('this is not an')],
    ['a PDF', head('%PDF-1.7')],
    ['a HEIC photo straight off an iPhone, renamed', head('ftypheic')],
    ['an empty file, which is what a cut-short upload leaves', head()],
  ])('rejects %s', (_what, bytes) => {
    expect(looksLikeImage(bytes)).toBe(false);
  });

  // A real PNG saved with a .jpg name is still a picture and Astro reads it, so
  // the bytes are what count and the file name is never consulted.
  it('does not care what the file is called', () => {
    expect(looksLikeImage(head([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  });
});

describe('notAnImageMessage', () => {
  it('names the file and says what to do', () => {
    const message = notAnImageMessage('probe.jpg');
    expect(message).toContain('probe.jpg');
    expect(message).toMatch(/upload the picture again/i);
    expect(message).not.toMatch(/metadata|src\/assets|node_modules/i);
  });
});
