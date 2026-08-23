import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { parseYouTubeId, YOUTUBE_HELP_MESSAGE } from '~/lib/youtube';
import { TICKET_STATUSES } from '~/lib/events';
import { BOOKING_URL_MESSAGE, requiresBookingUrl } from '~/lib/content-rules';

const uploadPath = z
  .string()
  .refine((value) => /\.(jpe?g|png|webp|avif|svg)$/i.test(value.trim()), {
    message: 'Image file name must end with .jpg, .png, .webp, .avif or .svg.',
  });

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
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
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
      venue: z.string().min(1),
      address: z.string().optional(),
      mapUrl: z.url().optional(),
      image: uploadPath.optional(),
      imageAlt: z.string().optional(),
      theme: z.string().optional(),
      summary: z.string().min(1).max(300),
      bookingUrl: z.url().optional(),
      bookingLabel: z.string().default('Book your seat'),
      ticketStatus: z.enum(TICKET_STATUSES),
      draft: z.boolean().default(false),
    })
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
        .array(z.object({ label: z.string().min(1), url: z.url() }))
        .default([]),
      order: z.number().int().optional(),
      draft: z.boolean().default(false),
    })
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
    url: z.url().optional(),
    tier: z.enum(['headline', 'gold', 'partner', 'community']),
    order: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { talks, events, speakers, sponsors };
