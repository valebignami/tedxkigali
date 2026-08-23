import { describe, expect, it } from 'vitest';
import { siteSettings, siteSettingsErrorMessage, siteSettingsSchema } from '~/lib/settings';
import { EMAIL_MESSAGE, TEXT_TOO_LONG_MESSAGE, WEB_ADDRESS_MESSAGE } from '~/lib/content-messages';

const valid = {
  siteName: 'TEDxKigali',
  tagline: 'Ideas worth spreading',
  heroTitle: 'Ideas worth spreading',
  heroSubtitle: 'An intro',
  aboutShort: 'About, short',
  aboutBody: 'About, long',
  contactEmail: 'hello@tedxkigali.rw',
  socials: [{ label: 'Instagram', url: 'https://www.instagram.com/tedxkigali' }],
  seoDescription: 'Talks and events from TEDxKigali.',
  tedxLicenceNotice: 'Operated under license from TED.',
  tedxXExplanation: 'x = independently organized TED event',
};

function messageFor(overrides: Record<string, unknown>): string {
  const parsed = siteSettingsSchema.safeParse({ ...valid, ...overrides });
  if (parsed.success) throw new Error('expected these site texts to be rejected');
  return siteSettingsErrorMessage(parsed.error);
}

describe('the shipped site texts', () => {
  it('are valid, so no volunteer inherits a broken build', () => {
    expect(siteSettings.siteName).toBe('TEDxKigali');
  });
});

describe('siteSettingsErrorMessage', () => {
  // The likeliest typo in the file, and the one the audit reproduced: before
  // this the volunteer got a Zod issue array, the email pattern and a stack
  // trace out of node_modules.
  it('names the CMS label and what to do when the contact email is wrong', () => {
    const message = messageFor({ contactEmail: 'hello at tedxkigali.rw' });
    expect(message).toContain('Contact email');
    expect(message).toContain(EMAIL_MESSAGE);
    expect(message).toContain('Open "Site texts" in the CMS');
  });

  it('never names a field by its code name', () => {
    const message = messageFor({ contactEmail: 'nope', seoDescription: 'x'.repeat(301) });
    expect(message).not.toMatch(/contactEmail|seoDescription|heroSubtitle|tedxXExplanation/);
  });

  // A volunteer who fixes one field per build waits for a build each time.
  it('lists every wrong field at once', () => {
    const message = messageFor({ contactEmail: 'nope', tagline: '', seoDescription: 'x'.repeat(301) });
    expect(message).toContain('Contact email');
    expect(message).toContain('Tagline');
    expect(message).toContain('Search engine description');
    expect(message).toContain(TEXT_TOO_LONG_MESSAGE);
  });

  // This message existed and was reachable, but the raw issue array used to
  // swallow it: social links are the field volunteers touch most often.
  it('shows the web address message for a broken social link, and says which row', () => {
    const message = messageFor({
      socials: [
        { label: 'Instagram', url: 'https://www.instagram.com/tedxkigali' },
        { label: 'X', url: 'x.com/tedxkigali' },
      ],
    });
    expect(message).toContain(WEB_ADDRESS_MESSAGE);
    expect(message).toContain('Social links, row 2, "Link"');
  });

  it('names an unknown field so a drifted form can be found', () => {
    const message = messageFor({ contactMail: 'hello@tedxkigali.rw' });
    expect(message).toContain('"contactMail"');
  });

  // The save is the one thing that did not fail — the file is in the
  // repository — and a volunteer told otherwise re-types work they still have.
  it('does not tell the volunteer their save failed', () => {
    const message = messageFor({ tagline: '' });
    expect(message).not.toMatch(/could not be saved/i);
    expect(message).toMatch(/was saved/i);
    expect(message).toMatch(/nothing you typed is lost/i);
  });

  // Whether the last published version stays up is a property of the hosting,
  // and Task 18 Step 6 has not been done. Nothing here may promise it.
  it('does not promise that the live site keeps showing the old version', () => {
    const message = messageFor({ tagline: '' });
    expect(message).not.toMatch(/keeps showing|goes on showing|visitors/i);
  });
});
