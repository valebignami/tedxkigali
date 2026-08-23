import { describe, expect, it } from 'vitest';
import * as messages from '~/lib/content-messages';

const entries = Object.entries(messages);

// Code names an editor never sees, plus the vocabulary of a stack trace. If one
// of these ever appears in a message, the message has stopped being editor-facing.
const JARGON =
  /\b(bookingUrl|mapUrl|youtubeUrl|thumbnailAlt|photoAlt|logoAlt|seoDescription|ticketStatus|frontmatter|zod|schema|regex|null|undefined|invalid)\b/i;

describe('content messages', () => {
  it('exports at least one message', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s is a non-empty sentence', (_name, message) => {
    expect(typeof message).toBe('string');
    expect(message.trim().length).toBeGreaterThan(20);
  });

  it.each(entries)('%s names no field and no jargon', (_name, message) => {
    expect(message).not.toMatch(JARGON);
  });
});

describe('WEB_ADDRESS_MESSAGE', () => {
  it('tells the editor the address must start with https://', () => {
    expect(messages.WEB_ADDRESS_MESSAGE).toContain('https://');
  });

  it('tells the editor where to copy the link from', () => {
    expect(messages.WEB_ADDRESS_MESSAGE).toMatch(/address bar/i);
  });
});
