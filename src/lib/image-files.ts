// A file that is named like a picture but is not one takes the build down in
// Vite's asset loader, before a single page renders: what comes out is an
// absolute path on the build machine, an Astro error code and six frames of
// node_modules, and nothing that says which upload caused it. Nothing in this
// project can catch that — it happens while Vite is transforming the module
// that lists the uploads, so there is no code of ours on the stack to try.
//
// It can be found earlier, though. The uploads folder is read here at the start
// of the build, before Vite is given anything, and a file whose first bytes are
// not any picture the site can read is named and refused in words.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Enough bytes to reach the AVIF/WEBP brand, which sits twelve in. */
const HEAD_BYTES = 16;

const startsWith = (head: Uint8Array, bytes: number[]) =>
  bytes.every((byte, index) => head[index] === byte);

const textAt = (head: Uint8Array, offset: number, text: string) =>
  [...text].every((character, index) => head[offset + index] === character.charCodeAt(0));

/**
 * True when the first bytes of a file are one of the picture formats the site
 * builds. The name is not consulted: a real PNG saved as .jpg is a picture, and
 * Astro reads it happily, so refusing it would invent a problem.
 */
export function looksLikeImage(head: Uint8Array): boolean {
  if (startsWith(head, [0xff, 0xd8, 0xff])) return true; // JPEG
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true; // PNG
  if (textAt(head, 0, 'RIFF') && textAt(head, 8, 'WEBP')) return true;
  if (textAt(head, 4, 'ftyp')) return true; // AVIF and the rest of the ISO-BMFF family
  // SVG is text, and may open with an XML declaration, a comment or a doctype
  // before the <svg> tag, so the first bytes only have to look like markup.
  const opening = new TextDecoder().decode(head).trimStart();
  return opening.startsWith('<?xml') || opening.startsWith('<svg') || opening.startsWith('<!--') || opening.startsWith('<!DOCTYPE');
}

/** Shown when an uploaded file cannot be a picture, whatever it is called. */
export function notAnImageMessage(fileName: string): string {
  return (
    `The file "${fileName}" is not a picture, whatever its name says. A file ` +
    'renamed to end in .jpg does not become one, and an upload that was cut ' +
    'short does not either. Upload the picture again, from the original.'
  );
}

/** Every uploaded file that is named like a picture but cannot be one. */
export function unreadableUploads(directory: string): string[] {
  let fileNames: string[];
  try {
    fileNames = readdirSync(directory);
  } catch {
    // No uploads folder yet is the state this project ships in, and is fine.
    return [];
  }
  return fileNames.filter((fileName) => {
    if (!/\.(jpe?g|png|webp|avif|svg)$/i.test(fileName)) return false;
    const head = new Uint8Array(HEAD_BYTES);
    try {
      const contents = readFileSync(join(directory, fileName));
      head.set(contents.subarray(0, Math.min(HEAD_BYTES, contents.length)));
    } catch {
      // A directory named like a picture, or a file being written as we read.
      return false;
    }
    return !looksLikeImage(head);
  });
}
