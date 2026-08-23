import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { parseYouTubeId, YOUTUBE_HELP_MESSAGE } from '~/lib/youtube';
import { TICKET_STATUSES } from '~/lib/events';
import { BOOKING_URL_MESSAGE, requiresBookingUrl } from '~/lib/content-rules';
import {
  SCHEDULE_TIME_MESSAGE,
  SCHEDULE_TITLE_MESSAGE,
  TAG_EMPTY_MESSAGE,
  TAG_SEPARATOR_MESSAGE,
  VENUE_MESSAGE,
  WEB_ADDRESS_MESSAGE,
} from '~/lib/content-messages';
import { isValidScheduleTime } from '~/lib/schedule';
import { SPONSOR_TIERS } from '~/lib/sponsors';

const uploadPath = z
  .string()
  .refine((value) => /\.(jpe?g|png|webp|avif|svg)$/i.test(value.trim()), {
    message: 'Image file name must end with .jpg, .png, .webp, .avif or .svg.',
  });

// A row of the event Programme. Order matters and is never re-sorted: a break
// with no time would otherwise jump to an arbitrary position, and the editor
// would lose control of the running order they typed.
const scheduleEntry = z
  .object({
    time: z
      .string()
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
    speaker: z.string().trim().optional(),
    note: z.string().trim().optional(),
  })
  .strict();

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z
    .object({
      title: z.string().min(1),
      speaker: z.string().min(1),
      youtubeUrl: z.string().refine((value) => parseYouTubeId(value) !== null, {
        message: YOUTUBE_HELP_MESSAGE,
      }),
      date: z.coerce.date(),
      edition: reference('events').optional(),
      summary: z.string().max(300).optional(),
      thumbnail: uploadPath.optional(),
      thumbnailAlt: z.string().optional(),
      featured: z.boolean().default(false),
      // TalkCard joins these with "|" into data-tags and talk-filters.ts splits
      // them again, so a tag containing that character would vanish from its
      // own filter, and an empty one would render a button with no name.
      tags: z
        .array(
          z
            .string()
            .trim()
            .min(1, { message: TAG_EMPTY_MESSAGE })
            .refine((tag) => !tag.includes('|'), { message: TAG_SEPARATOR_MESSAGE }),
        )
        .default([]),
      draft: z.boolean().default(false),
    })
    // .strict() sits on the object, before the refinements: a field renamed in
    // .pages.yml but not here (or the other way round) would otherwise write a
    // key nobody reads, and the value would vanish with a green build.
    .strict()
    .refine((data) => !data.thumbnail || (data.thumbnailAlt ?? '').trim() !== '', {
      message: 'Describe the cover image in "Cover image description" so screen readers can read it.',
      path: ['thumbnailAlt'],
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z
    .object({
      title: z.string().min(1),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      venue: z.string(VENUE_MESSAGE).trim().min(1, { message: VENUE_MESSAGE }),
      // Trimmed like venue above: venueLabel and the map link's accessible name
      // both test this with plain truthiness, so an untrimmed "   " would render
      // a link reading "Kigali Convention Centre —" with nothing after the dash.
      address: z.string().trim().optional(),
      mapUrl: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
      image: uploadPath.optional(),
      imageAlt: z.string().optional(),
      theme: z.string().optional(),
      summary: z.string().min(1).max(300),
      schedule: z.array(scheduleEntry).default([]),
      bookingUrl: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
      bookingLabel: z.string().default('Book your seat'),
      ticketStatus: z.enum(TICKET_STATUSES),
      draft: z.boolean().default(false),
    })
    .strict()
    .refine((data) => !data.image || (data.imageAlt ?? '').trim() !== '', {
      message: 'Describe the event image in "Image description" so screen readers can read it.',
      path: ['imageAlt'],
    })
    .refine((data) => !requiresBookingUrl(data.ticketStatus) || !!data.bookingUrl, {
      message: BOOKING_URL_MESSAGE,
      path: ['bookingUrl'],
    }),
});

const speakers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speakers' }),
  schema: z
    .object({
      name: z.string().min(1),
      role: z.string().optional(),
      photo: uploadPath.optional(),
      photoAlt: z.string().optional(),
      talk: reference('talks').optional(),
      links: z
        .array(
          z.object({ label: z.string().min(1), url: z.url({ message: WEB_ADDRESS_MESSAGE }) }).strict(),
        )
        .default([]),
      // See the sponsors collection: a decimal is a legitimate way to slot
      // someone between two existing positions.
      order: z.number().optional(),
      draft: z.boolean().default(false),
    })
    .strict()
    .refine((data) => !data.photo || (data.photoAlt ?? '').trim() !== '', {
      message: 'Describe the photo in "Photo description" so screen readers can read it.',
      path: ['photoAlt'],
    }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    name: z.string().min(1),
    logo: uploadPath,
    logoAlt: z.string().min(1, 'Describe the logo, for example "Acme Ltd logo".'),
    url: z.url({ message: WEB_ADDRESS_MESSAGE }).optional(),
    tier: z.enum(SPONSOR_TIERS),
    // Not .int(): the CMS field is a plain number and the help text says
    // "Lower numbers appear first", so a volunteer slotting a partner between
    // 1 and 2 types 1.5. The sort works with it.
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }).strict(),
});

export const collections = { talks, events, speakers, sponsors };
