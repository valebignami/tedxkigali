// Import from 'astro/zod', not from 'astro:content': this module is also loaded
// by Vitest (through src/lib/seo.ts), where the astro: virtual modules do not
// exist, while 'astro/zod' is a normal package subpath that resolves anywhere.
import { z } from 'astro/zod';
import raw from '~/content/settings/site.json';
import { MAX_TEXT_LENGTH, unknownFieldMessage } from '~/lib/content-rules';
import { editorError } from '~/lib/editor-error';
import {
  EMAIL_MESSAGE,
  SITE_TEXT_EMPTY_MESSAGE,
  TEXT_TOO_LONG_MESSAGE,
  WEB_ADDRESS_MESSAGE,
} from '~/lib/content-messages';

// The type message matters as much as the length one: a field the CMS never
// wrote at all arrives as nothing, not as an empty string, and Zod's own words
// for that are "expected string, received undefined".
const requiredText = () =>
  z.string({ error: SITE_TEXT_EMPTY_MESSAGE }).min(1, { message: SITE_TEXT_EMPTY_MESSAGE });

const unknownKeys = {
  error: (issue: z.core.$ZodRawIssue) =>
    issue.code === 'unrecognized_keys' ? unknownFieldMessage(issue.keys) : undefined,
};

const socialLink = z.strictObject(
  {
    label: requiredText(),
    url: z.url({ message: WEB_ADDRESS_MESSAGE }),
  },
  unknownKeys,
);

export const siteSettingsSchema = z.strictObject(
  {
    siteName: requiredText(),
    tagline: requiredText(),
    heroTitle: requiredText(),
    heroSubtitle: requiredText(),
    aboutShort: requiredText(),
    aboutBody: requiredText(),
    contactEmail: z.email({ message: EMAIL_MESSAGE }),
    socials: z.array(socialLink).default([]),
    seoDescription: requiredText().max(MAX_TEXT_LENGTH, { message: TEXT_TOO_LONG_MESSAGE }),
    tedxLicenceNotice: requiredText(),
    tedxXExplanation: requiredText(),
  },
  // A key here that no field in .pages.yml writes, or the other way round, is a
  // rename that drifted: better a failed build than a text silently missing
  // from every page.
  unknownKeys,
);

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// The labels the CMS puts above these fields, which are the only names a
// volunteer has ever seen for them. This form is not a content collection, so
// unlike everywhere else nothing prepends a code name and the whole message is
// ours to write. Keep in step with the "Site texts" section of .pages.yml.
const SITE_TEXT_LABELS: Record<string, string> = {
  siteName: 'Site name',
  tagline: 'Tagline',
  heroTitle: 'Home page headline',
  heroSubtitle: 'Home page intro',
  aboutShort: 'Short about text',
  aboutBody: 'About page text',
  contactEmail: 'Contact email',
  socials: 'Social links',
  seoDescription: 'Search engine description',
  tedxLicenceNotice: 'TED licence notice',
  tedxXExplanation: 'Meaning of the x',
};

const SOCIAL_SUB_LABELS: Record<string, string> = { label: 'Name', url: 'Link' };

function fieldLabel(path: ReadonlyArray<PropertyKey>): string | undefined {
  const [first, index, nested] = path;
  if (first === undefined) return undefined;
  const label = SITE_TEXT_LABELS[String(first)] ?? String(first);
  if (first !== 'socials' || typeof index !== 'number') return label;
  // Rows are numbered from one, because that is how the CMS lists them and
  // because nothing outside a program counts from zero.
  const inner = SOCIAL_SUB_LABELS[String(nested)] ?? String(nested);
  return `${label}, row ${index + 1}, "${inner}"`;
}

/**
 * Turns a failed parse of the "Site texts" file into something a volunteer can
 * act on. Every field of this form is required and every one of them is edited
 * by volunteers, so the list is complete on purpose: fixing them one build at a
 * time would cost one failed build each.
 */
export function siteSettingsErrorMessage(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const label = fieldLabel(issue.path);
    return label ? `  ${label} — ${issue.message}` : `  ${issue.message}`;
  });
  return [
    'The "Site texts" of the website could not be saved.',
    '',
    ...lines,
    '',
    'Open "Site texts" in the CMS, correct every line above, and save again. ' +
      'Until then the website keeps showing what it showed before.',
  ].join('\n');
}

function parseSettings(): SiteSettings {
  const parsed = siteSettingsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  throw editorError(siteSettingsErrorMessage(parsed.error));
}

// Parsed at build time: a malformed settings file fails the build instead of
// shipping a broken page.
export const siteSettings: SiteSettings = parseSettings();
