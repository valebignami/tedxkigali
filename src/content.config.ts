import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { parseYouTubeId, YOUTUBE_HELP_MESSAGE } from '~/lib/youtube';
import { TICKET_STATUSES } from '~/lib/events';
import {
  BOOKING_URL_MESSAGE,
  MAX_TEXT_LENGTH,
  requiresBookingUrl,
  unknownFieldMessage,
} from '~/lib/content-rules';
import {
  ADDRESS_MESSAGE,
  BOOKING_LABEL_MESSAGE,
  DATE_MESSAGE,
  DISPLAY_ORDER_MESSAGE,
  EVENT_END_BEFORE_START_MESSAGE,
  EVENT_IMAGE_ALT_MESSAGE,
  EVENT_SUMMARY_MESSAGE,
  EVENT_THEME_MESSAGE,
  EVENT_TITLE_MESSAGE,
  IMAGE_FILE_TYPE_MESSAGE,
  LINK_NAME_MESSAGE,
  PARTNER_LEVEL_MESSAGE,
  PARTNER_LOGO_ALT_MESSAGE,
  PARTNER_NAME_MESSAGE,
  SCHEDULE_NOTE_MESSAGE,
  SCHEDULE_SPEAKER_MESSAGE,
  SCHEDULE_TIME_MESSAGE,
  SCHEDULE_TITLE_MESSAGE,
  SPEAKER_NAME_MESSAGE,
  SPEAKER_PHOTO_ALT_MESSAGE,
  SPEAKER_ROLE_MESSAGE,
  SPEAKER_TALK_MESSAGE,
  TAG_EMPTY_MESSAGE,
  TAG_SEPARATOR_MESSAGE,
  TAG_TEXT_MESSAGE,
  TALK_COVER_ALT_MESSAGE,
  TALK_EDITION_MESSAGE,
  TALK_SPEAKER_MESSAGE,
  TALK_TITLE_MESSAGE,
  TEXT_TOO_LONG_MESSAGE,
  TICKET_STATUS_MESSAGE,
  VENUE_MESSAGE,
  WEB_ADDRESS_MESSAGE,
  YES_NO_MESSAGE,
} from '~/lib/content-messages';
import { editorError } from '~/lib/editor-error';
import { offKigaliTimeFields, offKigaliTimeMessage, writtenEventTitle } from '~/lib/event-times';
import { isValidScheduleTime } from '~/lib/schedule';
import { SPONSOR_TIERS } from '~/lib/sponsors';

// .strict() takes no message of its own, so every collection is built with
// z.strictObject: a field renamed in .pages.yml but not here (or the other way
// round) would otherwise write a key nobody reads, and the value would vanish
// with a green build. The callback returns undefined for every other kind of
// mistake, which leaves that field's own message in place.
const strictObject = <T extends z.ZodRawShape>(shape: T) =>
  z.strictObject(shape, {
    error: (issue) => (issue.code === 'unrecognized_keys' ? unknownFieldMessage(issue.keys) : undefined),
  });

const yesNo = () => z.boolean({ error: YES_NO_MESSAGE }).default(false);

const uploadPath = z
  .string({ error: IMAGE_FILE_TYPE_MESSAGE })
  .refine((value) => /\.(jpe?g|png|webp|avif|svg)$/i.test(value.trim()), {
    message: IMAGE_FILE_TYPE_MESSAGE,
  });

// A row of the event Programme. Order matters and is never re-sorted: a break
// with no time would otherwise jump to an arbitrary position, and the editor
// would lose control of the running order they typed.
const scheduleEntry = strictObject({
  time: z
    .string(SCHEDULE_TIME_MESSAGE)
    .trim()
    .optional()
    .refine((value) => !value || isValidScheduleTime(value), {
      message: SCHEDULE_TIME_MESSAGE,
    }),
  // The message is given twice because two different mistakes reach it: the
  // key missing altogether (a row saved before anything was typed into it)
  // fails the type, and a blank or all-spaces value fails the length. Without
  // the first, the volunteer gets Zod's own "expected string, received
  // undefined" in the failed-build email.
  title: z.string(SCHEDULE_TITLE_MESSAGE).trim().min(1, { message: SCHEDULE_TITLE_MESSAGE }),
  speaker: z.string(SCHEDULE_SPEAKER_MESSAGE).trim().optional(),
  note: z.string(SCHEDULE_NOTE_MESSAGE).trim().optional(),
});

// The edition and the talk a speaker gave are plain stored ids, not Astro
// reference() values. Astro checks a reference() by logging "Invalid content
// reference: entry … in collection …" and then finishing the build with exit 0:
// the raw sentence lands above the written one in the same log, and a talk
// deleted out from under a speaker publishes a half-broken card. src/lib/
// editions.ts and src/pages/speakers.astro make the same check themselves, in
// words an editor can act on, and stop the build.
//
// Every mistake these two fields can hold reaches the same message, because
// the CMS only ever writes them by picking from a list: anything else in there
// was typed into the file by hand.
const storedId = (message: string) => z.string(message).trim().optional();

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: strictObject({
    title: z.string({ error: TALK_TITLE_MESSAGE }).min(1, { message: TALK_TITLE_MESSAGE }),
    speaker: z.string({ error: TALK_SPEAKER_MESSAGE }).min(1, { message: TALK_SPEAKER_MESSAGE }),
    youtubeUrl: z.string({ error: YOUTUBE_HELP_MESSAGE }).refine((value) => parseYouTubeId(value) !== null, {
      message: YOUTUBE_HELP_MESSAGE,
    }),
    date: z.coerce.date({ error: DATE_MESSAGE }),
    edition: storedId(TALK_EDITION_MESSAGE),
    summary: z.string().max(MAX_TEXT_LENGTH, { message: TEXT_TOO_LONG_MESSAGE }).optional(),
    thumbnail: uploadPath.optional(),
    thumbnailAlt: z.string(TALK_COVER_ALT_MESSAGE).optional(),
    featured: yesNo(),
    // TalkCard joins these with "|" into data-tags and talk-filters.ts splits
    // them again, so a tag containing that character would vanish from its
    // own filter, and an empty one would render a button with no name.
    tags: z
      .array(
        z
          .string(TAG_TEXT_MESSAGE)
          .trim()
          .min(1, { message: TAG_EMPTY_MESSAGE })
          .refine((tag) => !tag.includes('|'), { message: TAG_SEPARATOR_MESSAGE }),
      )
      .default([]),
    draft: yesNo(),
  }).refine((data) => !data.thumbnail || (data.thumbnailAlt ?? '').trim() !== '', {
    message: TALK_COVER_ALT_MESSAGE,
    path: ['thumbnailAlt'],
  }),
});

const EVENTS_DIR = './src/content/events';

/**
 * The glob loader, plus the one check that cannot be made from the loaded data:
 * whether the times in the file are Kigali's. It runs on every content sync,
 * because a file the editor saved a minute ago has to be checked with the same
 * build that publishes it.
 */
function eventsLoader(): Loader {
  const files = glob({ pattern: '**/*.md', base: EVENTS_DIR });
  return {
    ...files,
    load: async (context) => {
      await files.load(context);
      // Recursive, because the loader's pattern is: a folder per year is a
      // shape the CMS could produce, and an event inside one would otherwise be
      // published without ever being checked.
      const fileNames = readdirSync(EVENTS_DIR, { recursive: true }) as string[];
      for (const fileName of fileNames.filter((name) => name.endsWith('.md'))) {
        const source = readFileSync(join(EVENTS_DIR, fileName), 'utf8');
        const wrong = offKigaliTimeFields(source);
        if (wrong.length === 0) continue;
        throw editorError(offKigaliTimeMessage(writtenEventTitle(source) || fileName, wrong));
      }
    },
  };
}

const events = defineCollection({
  loader: eventsLoader(),
  schema: strictObject({
    title: z.string({ error: EVENT_TITLE_MESSAGE }).min(1, { message: EVENT_TITLE_MESSAGE }),
    startDate: z.coerce.date({ error: DATE_MESSAGE }),
    endDate: z.coerce.date({ error: DATE_MESSAGE }).optional(),
    venue: z.string(VENUE_MESSAGE).trim().min(1, { message: VENUE_MESSAGE }),
    // Trimmed like venue above: venueLabel and the map link's accessible name
    // both test this with plain truthiness, so an untrimmed "   " would render
    // a link reading "Kigali Convention Centre —" with nothing after the dash.
    address: z.string(ADDRESS_MESSAGE).trim().optional(),
    mapUrl: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
    image: uploadPath.optional(),
    imageAlt: z.string(EVENT_IMAGE_ALT_MESSAGE).optional(),
    theme: z.string(EVENT_THEME_MESSAGE).optional(),
    summary: z
      .string({ error: EVENT_SUMMARY_MESSAGE })
      .min(1, { message: EVENT_SUMMARY_MESSAGE })
      .max(MAX_TEXT_LENGTH, { message: TEXT_TOO_LONG_MESSAGE }),
    schedule: z.array(scheduleEntry).default([]),
    bookingUrl: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
    bookingLabel: z.string({ error: BOOKING_LABEL_MESSAGE }).default('Book your seat'),
    ticketStatus: z.enum(TICKET_STATUSES, { error: TICKET_STATUS_MESSAGE }),
    draft: yesNo(),
  })
    .refine((data) => !data.image || (data.imageAlt ?? '').trim() !== '', {
      message: EVENT_IMAGE_ALT_MESSAGE,
      path: ['imageAlt'],
    })
    // eventEnd() falls back to four hours after the start for an end time that
    // is not later than it, so without this the editor's mistake would be
    // swallowed and an invented end time published to Google as fact.
    .refine((data) => !data.endDate || data.endDate.getTime() > data.startDate.getTime(), {
      message: EVENT_END_BEFORE_START_MESSAGE,
      path: ['endDate'],
    })
    .refine((data) => !requiresBookingUrl(data.ticketStatus) || !!data.bookingUrl, {
      message: BOOKING_URL_MESSAGE,
      path: ['bookingUrl'],
    }),
});

const speakers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speakers' }),
  schema: strictObject({
    name: z.string({ error: SPEAKER_NAME_MESSAGE }).min(1, { message: SPEAKER_NAME_MESSAGE }),
    role: z.string(SPEAKER_ROLE_MESSAGE).optional(),
    photo: uploadPath.optional(),
    photoAlt: z.string(SPEAKER_PHOTO_ALT_MESSAGE).optional(),
    talk: storedId(SPEAKER_TALK_MESSAGE),
    links: z
      .array(
        strictObject({
          label: z.string({ error: LINK_NAME_MESSAGE }).min(1, { message: LINK_NAME_MESSAGE }),
          url: z.url({ message: WEB_ADDRESS_MESSAGE }),
        }),
      )
      .default([]),
    // See the sponsors collection: a decimal is a legitimate way to slot
    // someone between two existing positions.
    order: z.number({ error: DISPLAY_ORDER_MESSAGE }).optional(),
    draft: yesNo(),
  }).refine((data) => !data.photo || (data.photoAlt ?? '').trim() !== '', {
    message: SPEAKER_PHOTO_ALT_MESSAGE,
    path: ['photoAlt'],
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: strictObject({
    name: z.string({ error: PARTNER_NAME_MESSAGE }).min(1, { message: PARTNER_NAME_MESSAGE }),
    logo: uploadPath,
    logoAlt: z.string({ error: PARTNER_LOGO_ALT_MESSAGE }).min(1, { message: PARTNER_LOGO_ALT_MESSAGE }),
    url: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
    tier: z.enum(SPONSOR_TIERS, { error: PARTNER_LEVEL_MESSAGE }),
    // Not .int(): the CMS field is a plain number and the help text says
    // "Lower numbers appear first", so a volunteer slotting a partner between
    // 1 and 2 types 1.5. The sort works with it.
    order: z.number({ error: DISPLAY_ORDER_MESSAGE }).optional(),
    draft: yesNo(),
  }),
});

export const collections = { talks, events, speakers, sponsors };
