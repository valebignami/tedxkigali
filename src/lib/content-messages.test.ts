import { describe, expect, it } from 'vitest';
import * as messages from '~/lib/content-messages';
import { BOOKING_URL_MESSAGE, unknownFieldMessage } from '~/lib/content-rules';
import { hiddenEditionMessage, missingEditionMessage } from '~/lib/editions';
import { eventInSubFolderMessage } from '~/lib/event-files';
import { missingTimeOfDayMessage } from '~/lib/event-times';
import { notAnImageMessage } from '~/lib/image-files';
import { imageNotFoundMessage } from '~/lib/images';
import { PROGRAMME_MESSAGE } from '~/lib/programmes';
import { missingTalkMessage } from '~/lib/speaker-talk';
import { YOUTUBE_HELP_MESSAGE } from '~/lib/youtube';
import { siteSettingsErrorMessage, siteSettingsSchema } from '~/lib/settings';

// Every message a volunteer can be shown, wherever it is written. The ones that
// need a name or an id to make sense are called here with a plausible one: the
// rule is about the words around it, and the file that held them used to be the
// only one this test could see.
const settingsFailure = siteSettingsSchema.safeParse({ nonsense: true });
const entries: Array<[string, string]> = [
  ...Object.entries(messages),
  ['BOOKING_URL_MESSAGE', BOOKING_URL_MESSAGE],
  ['YOUTUBE_HELP_MESSAGE', YOUTUBE_HELP_MESSAGE],
  ['PROGRAMME_MESSAGE', PROGRAMME_MESSAGE],
  ['unknownFieldMessage', unknownFieldMessage(['Summary'])],
  ['missingEditionMessage', missingEditionMessage('The market at dawn', 'tedxkigali-2027')],
  ['hiddenEditionMessage', hiddenEditionMessage('The market at dawn', 'TEDxKigali 2025 — Roots')],
  ['missingTalkMessage', missingTalkMessage('Aline Uwase', 'the-hills-that-listen')],
  ['missingTimeOfDayMessage', missingTimeOfDayMessage('TEDxKigali 2026', ['Start date and time'])],
  ['eventInSubFolderMessage', eventInSubFolderMessage('2027/tedxkigali-2027.md')],
  ['imageNotFoundMessage', imageNotFoundMessage('IMG_1234.JPG')],
  ['notAnImageMessage', notAnImageMessage('IMG_1234.JPG')],
  [
    'siteSettingsErrorMessage',
    settingsFailure.success ? '' : siteSettingsErrorMessage(settingsFailure.error),
  ],
];

// Code names an editor never sees, plus the vocabulary of a stack trace. If one
// of these ever appears in a message, the message has stopped being editor-facing.
const JARGON =
  /\b(bookingUrl|mapUrl|youtubeUrl|thumbnailAlt|photoAlt|logoAlt|seoDescription|ticketStatus|startDate|endDate|frontmatter|zod|schema|regex|null|undefined|invalid)\b/i;

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

  // Every one of these is read by somebody who has to do something next. A
  // message that only describes the mistake leaves them where they started.
  it.each(entries)('%s tells the reader what to do', (_name, message) => {
    expect(message).toMatch(
      /\b(write|type|pick|copy|paste|open|save|delete|remove|take it out|shorten|upload|use|set|check|empty|change|turn|add|send|make|leave|correct|describe|ask)\b/i,
    );
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

// The stored codes are not what the CMS shows: a volunteer who reads
// "coming-soon" has nothing in front of them that says so.
describe('the messages for the lists of choices', () => {
  it('spell out the ticket statuses the way the CMS labels them', () => {
    expect(messages.TICKET_STATUS_MESSAGE).toContain('Tickets coming soon');
    expect(messages.TICKET_STATUS_MESSAGE).toContain('Sold out');
    expect(messages.TICKET_STATUS_MESSAGE).not.toMatch(/coming-soon|sold-out/);
  });

  it('spell out the programmes by the names TED gives them', () => {
    expect(PROGRAMME_MESSAGE).toContain('TEDxKigali Women');
    expect(PROGRAMME_MESSAGE).toContain('TEDxKigali Countdown');
    expect(PROGRAMME_MESSAGE).not.toMatch(/flagship|countdown"/);
  });

  it('spell out the partner levels the way the CMS labels them', () => {
    expect(messages.PARTNER_LEVEL_MESSAGE).toContain('Headline partner');
    expect(messages.PARTNER_LEVEL_MESSAGE).toContain('Community partner');
    expect(messages.PARTNER_LEVEL_MESSAGE).not.toMatch(/headline"|community"/);
  });
});
