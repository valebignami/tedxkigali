import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { MAX_TEXT_LENGTH } from '~/lib/content-rules';
import { TICKET_STATUSES, ticketStatusLabel } from '~/lib/events';
import { siteSettingsErrorMessage, siteSettingsSchema } from '~/lib/settings';
import { SPONSOR_TIER_LABELS, SPONSOR_TIERS } from '~/lib/sponsors';

// The CMS form is YAML, so every list of choices it offers is a hand-made copy
// of a TypeScript constant that no compiler compares it to. src/lib/sponsors.ts
// says as much and asks for the copy to be kept in step by hand; this file is
// that request, run on every push instead of remembered.
//
// It reads the real .pages.yml, not a fixture: a fixture would be a further
// copy, and the drift being looked for is between the file Pages CMS loads and
// the code the build runs.

type Field = {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  description?: string;
  pattern?: string | { regex: string; message?: string };
  options?: Record<string, unknown>;
  fields?: Field[];
};

type Collection = { name: string; fields: Field[]; view?: Record<string, unknown> };

const config = parse(
  readFileSync(fileURLToPath(new URL('../../.pages.yml', import.meta.url)), 'utf8'),
) as { content: Collection[] };

const collection = (name: string): Collection => {
  const found = config.content.find((item) => item.name === name);
  if (!found) throw new Error(`.pages.yml has no "${name}" section`);
  return found;
};

const field = (collectionName: string, fieldName: string): Field => {
  const found = collection(collectionName).fields.find((item) => item.name === fieldName);
  if (!found) throw new Error(`.pages.yml has no "${fieldName}" field in "${collectionName}"`);
  return found;
};

/** Every field in the file, sub-fields included, with its dotted path. */
const everyField = (): Array<[string, Field]> => {
  const out: Array<[string, Field]> = [];
  const walk = (fields: Field[], prefix: string) => {
    for (const item of fields) {
      out.push([prefix + item.name, item]);
      if (item.fields) walk(item.fields, `${prefix + item.name}.`);
    }
  };
  for (const item of config.content) walk(item.fields, `${item.name}.`);
  return out;
};

const selectValues = (item: Field) =>
  (item.options?.values as Array<{ value: string; label: string }>) ?? [];

describe('the choices the CMS offers', () => {
  it("are the five ticket statuses the site knows, with the site's own labels", () => {
    const values = selectValues(field('events', 'ticketStatus'));
    expect(values.map((choice) => choice.value)).toEqual([...TICKET_STATUSES]);
    for (const choice of values) {
      expect(choice.label).toBe(ticketStatusLabel(choice.value as (typeof TICKET_STATUSES)[number]));
    }
  });

  it('are the four partner levels the site knows', () => {
    const values = selectValues(field('sponsors', 'tier'));
    expect(values.map((choice) => choice.value)).toEqual([...SPONSOR_TIERS]);
  });

  // The select labels are singular ("Gold partner") and the page headings are
  // plural ("Gold partners"), on purpose: one names a partner, the other names
  // a block of them. The help text quotes the headings, so it is the headings
  // this checks, in the order the page prints them.
  it('name the four Partners-page headings in page order in the help text', () => {
    const description = field('sponsors', 'tier').description ?? '';
    // Quoted, because the description also uses the word "Partners" for the
    // page itself, which an unquoted search would find first.
    const positions = SPONSOR_TIERS.map((tier) =>
      description.indexOf(`"${SPONSOR_TIER_LABELS[tier]}"`),
    );
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe('the character limit the CMS shows', () => {
  it('is the limit the build enforces, in every field that sets one', () => {
    const limited = everyField().filter(([, item]) => item.options?.maxlength !== undefined);
    expect(limited.length).toBeGreaterThan(0);
    for (const [path, item] of limited) {
      expect(`${path}: ${item.options?.maxlength}`).toBe(`${path}: ${MAX_TEXT_LENGTH}`);
    }
  });

  it('is the number written into every help text that quotes one', () => {
    for (const [path, item] of everyField()) {
      const quoted = item.description?.match(/max (\d+) characters/i);
      if (quoted) expect(`${path}: ${quoted[1]}`).toBe(`${path}: ${MAX_TEXT_LENGTH}`);
    }
  });
});

// A `pattern` is checked against the value the form is holding, and an optional
// field nobody touched holds an empty string rather than nothing. A pattern
// that does not allow an empty string therefore makes an optional field
// impossible to leave empty — the save is refused with no way forward except
// filling in a field the site never needed.
describe('every pattern in the form', () => {
  it('allows an empty value exactly when the field is optional', () => {
    const patterned = everyField().filter(([, item]) => item.pattern !== undefined);
    expect(patterned.length).toBeGreaterThan(0);
    for (const [path, item] of patterned) {
      const source = typeof item.pattern === 'string' ? item.pattern : item.pattern!.regex;
      const allowsEmpty = new RegExp(source).test('');
      expect(`${path} allows empty: ${allowsEmpty}`).toBe(`${path} allows empty: ${!item.required}`);
    }
  });

  it('accepts a complete https:// address and refuses one without the scheme', () => {
    for (const [path, item] of everyField()) {
      if (item.pattern === undefined || item.type !== 'string') continue;
      const source = typeof item.pattern === 'string' ? item.pattern : item.pattern!.regex;
      if (!source.includes('https')) continue;
      const test = new RegExp(source);
      expect(`${path}: ${test.test('https://www.eventbrite.com/e/12345')}`).toBe(`${path}: true`);
      expect(`${path}: ${test.test('www.eventbrite.com/e/12345')}`).toBe(`${path}: false`);
    }
  });
});

describe('the "Site texts" form', () => {
  const settings = collection('settings');

  it('holds exactly the fields the settings file is read with', () => {
    expect(settings.fields.map((item) => item.name)).toEqual(
      Object.keys(siteSettingsSchema.shape),
    );
  });

  it('holds exactly the two sub-fields a social link is read with', () => {
    const socials = settings.fields.find((item) => item.name === 'socials');
    const shape = (siteSettingsSchema.shape.socials.unwrap().element as { shape: Record<string, unknown> })
      .shape;
    expect(socials?.fields?.map((item) => item.name)).toEqual(Object.keys(shape));
  });

  // The labels are the only names a volunteer has ever seen for these fields,
  // and a failed build repeats them back. src/lib/settings.ts keeps its own
  // copy of them for that message.
  it('names its fields in a failed build the way the form names them', () => {
    const failure = siteSettingsSchema.safeParse({});
    expect(failure.success).toBe(false);
    const message = failure.success ? '' : siteSettingsErrorMessage(failure.error);
    for (const item of settings.fields) {
      if (item.name === 'socials') continue; // has a default, so nothing is missing
      expect(message).toContain(`  ${item.label} — `);
    }
  });

  it("names a social link's own fields the way the form names them", () => {
    const failure = siteSettingsSchema.safeParse({ socials: [{ label: '', url: 'nope' }] });
    expect(failure.success).toBe(false);
    const message = failure.success ? '' : siteSettingsErrorMessage(failure.error);
    const socials = settings.fields.find((item) => item.name === 'socials');
    for (const sub of socials?.fields ?? []) {
      expect(message).toContain(`${socials?.label}, row 1, "${sub.label}"`);
    }
  });
});

describe('the order of the Events form', () => {
  // Whether a booking link is required at all depends on the ticket status, so
  // a volunteer who meets the link first has been asked a question they cannot
  // answer yet.
  it('asks for the ticket status before the booking link', () => {
    const names = collection('events').fields.map((item) => item.name);
    expect(names.indexOf('ticketStatus')).toBeLessThan(names.indexOf('bookingUrl'));
  });

  // Every list in this file puts what the volunteer must fill in first: a list
  // field's own help text is invisible until the list has a row in it, so the
  // first sub-field is the first thing they read inside one.
  it('asks what happens before what time it happens', () => {
    const names = field('events', 'schedule').fields?.map((item) => item.name) ?? [];
    expect(names.indexOf('title')).toBeLessThan(names.indexOf('time'));
  });
});

describe('every list view', () => {
  // The guide makes hiding an entry routine, and predicts one build failure
  // that is recovered by finding the hidden ones.
  it('shows whether an entry is hidden', () => {
    for (const item of config.content) {
      if (!item.view) continue;
      expect(`${item.name}: ${(item.view.fields as string[]).includes('draft')}`).toBe(
        `${item.name}: true`,
      );
    }
  });

  it('says how it is sorted rather than leaving it to the CMS', () => {
    for (const item of config.content) {
      if (!item.view) continue;
      expect(`${item.name}: ${item.view.default !== undefined}`).toBe(`${item.name}: true`);
    }
  });
});
