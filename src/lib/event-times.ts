// The one editor mistake the site cannot notice on its own once the file is
// loaded. YAML turns "2026-11-14T09:00:00+01:00" into a Date before any schema
// sees it, and a Date is an instant with no time zone left on it, so by then
// "09:00 in Brussels" and "10:00 in Kigali" are the same value and neither one
// looks wrong. The offset only exists in the text of the file, which is why
// these functions read the file and not the parsed entry.

import { EVENT_TIME_ZONE_MESSAGE, MISSING_TIME_OF_DAY_MESSAGE } from '~/lib/content-messages';

/** Kigali is on CAT all year: no daylight saving, so one offset covers every date. */
export const KIGALI_UTC_OFFSET = '+02:00';

const WRITTEN_DATE_TIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*([+-]\d{2}:?\d{2}|Z)$/i;

/** A day on its own, with nothing after it: "2026-11-14". */
const WRITTEN_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** The CMS labels of the two event fields that carry a time of day. */
const EVENT_DATE_FIELDS: ReadonlyArray<readonly [key: string, label: string]> = [
  ['startDate', 'Start date and time'],
  ['endDate', 'End date and time'],
];

/**
 * True when a written date and time says, in the file, that it is Kigali time.
 * A value with no time zone on it is not: YAML reads it as UTC, which is two
 * hours out, and nothing downstream can tell that apart from a deliberate one.
 */
export function isOnKigaliTime(written: string): boolean {
  const match = WRITTEN_DATE_TIME.exec(written.trim());
  if (!match) return false;
  return match[3].toUpperCase().replace(':', '') === KIGALI_UTC_OFFSET.replace(':', '');
}

function frontmatterOf(source: string): string {
  return /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? '';
}

function writtenValue(frontmatter: string, key: string): string {
  const line = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(frontmatter);
  return (line?.[1] ?? '').trim().replace(/^(["'])(.*)\1$/, '$2');
}

/** The event title as the editor typed it, for a message they have to act on. */
export function writtenEventTitle(source: string): string {
  return writtenValue(frontmatterOf(source), 'title');
}

/**
 * The CMS labels of the date fields in this file that carry a day and no time
 * of day. Refusing these is right — YAML reads a bare date as midnight UTC,
 * which is 02:00 in Kigali, an hour nobody chose — but the remedy is to pick a
 * time, not to move the computer's clock, so they are told apart from the
 * fields the time-zone check below answers for.
 */
export function missingTimeOfDayFields(source: string): string[] {
  const frontmatter = frontmatterOf(source);
  return EVENT_DATE_FIELDS.filter(([key]) => WRITTEN_DATE_ONLY.test(writtenValue(frontmatter, key))).map(
    ([, label]) => label,
  );
}

/** The CMS labels of the date fields in this file that are not on Kigali time. */
export function offKigaliTimeFields(source: string): string[] {
  const frontmatter = frontmatterOf(source);
  return EVENT_DATE_FIELDS.filter(([key]) => {
    const written = writtenValue(frontmatter, key);
    if (written === '' || WRITTEN_DATE_ONLY.test(written)) return false;
    return !isOnKigaliTime(written);
  }).map(([, label]) => label);
}

/**
 * Names the event and the fields, then says what to do. The first clause used
 * to be `The event "X", in "Start date and time".` — no verb in it, which is
 * not a sentence, and it is the first thing a reader working in a second
 * language meets.
 */
function aboutTheEvent(eventTitle: string, labels: ReadonlyArray<string>): string {
  const which = labels.map((label) => `"${label}"`).join(' and ');
  return `The event "${eventTitle}" has a problem in ${which}.`;
}

/** The build-failure message a volunteer receives for a mistimed event. */
export function offKigaliTimeMessage(eventTitle: string, labels: ReadonlyArray<string>): string {
  return `${aboutTheEvent(eventTitle, labels)} ${EVENT_TIME_ZONE_MESSAGE}`;
}

/** The build-failure message for an event given a day but no time of day. */
export function missingTimeOfDayMessage(eventTitle: string, labels: ReadonlyArray<string>): string {
  return `${aboutTheEvent(eventTitle, labels)} ${MISSING_TIME_OF_DAY_MESSAGE}`;
}
