// Import from 'astro/zod', not from 'astro:content': this module is also loaded
// by Vitest (through src/lib/seo.ts), where the astro: virtual modules do not
// exist, while 'astro/zod' is a normal package subpath that resolves anywhere.
import { z } from 'astro/zod';
import raw from '~/content/settings/site.json';
import { WEB_ADDRESS_MESSAGE } from '~/lib/content-messages';

const socialLink = z
  .object({
    label: z.string().min(1),
    url: z.url({ message: WEB_ADDRESS_MESSAGE }),
  })
  .strict();

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  aboutShort: z.string().min(1),
  aboutBody: z.string().min(1),
  contactEmail: z.email(),
  socials: z.array(socialLink).default([]),
  seoDescription: z.string().min(1).max(300),
  tedxLicenceNotice: z.string().min(1),
  tedxXExplanation: z.string().min(1),
})
  // A key here that no field in .pages.yml writes, or the other way round, is a
  // rename that drifted: better a failed build than a text silently missing
  // from every page.
  .strict();

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// Parsed at build time: a malformed settings file fails the build instead of
// shipping a broken page.
export const siteSettings: SiteSettings = siteSettingsSchema.parse(raw);
