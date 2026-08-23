// Where an event's start and end stop being "the numbers a volunteer typed" and
// become an instant. YAML turns "2026-11-14T09:00:00+00:00" into a Date before
// any schema sees it, and a Date is an instant with no time zone left on it, so
// by then the offset written in the file has already been applied and cannot be
// taken back off. These functions therefore read the text of the file, not the
// parsed entry.
//
// The first real save from Pages CMS settled what that text looks like. The
// editor's computer read 15:21 and a clock in Kigali read 13:21, and the CMS
// wrote `startDate: 2026-08-23T15:21:00+00:00`: it neither converted the time
// nor used the editor's own offset — it stamped +00:00 on the wall-clock numbers
// the editor picked. So the offset in an event file says nothing true about
// where the editor was, and the only meaning it can be given that is right for
// everybody is the one the CMS help text already asks for: the numbers are the
// numbers a clock in Kigali will show.

import { MISSING_TIME_OF_DAY_MESSAGE } from '~/lib/content-messages';

/**
 * Rwanda keeps one offset all year, so a fixed one is exact on every date and
 * no daylight-saving rule has to be carried here. Checked against the time-zone
 * data Node ships: Africa/Kigali formats as GMT+02:00 on the 1st, 15th and 28th
 * of every month of 2024–2027, and in January and July of every year from 1990
 * to 2040 — one offset, in every sample.
 */
const KIGALI_UTC_OFFSET = '+02:00';

/**
 * A written day and time of day, with any offset marker the file happens to
 * carry — or none. The offset is matched but not captured, because it is the
 * one part of the value this project does not believe.
 */
const WRITTEN_DATE_TIME =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*(?:[+-]\d{2}:?\d{2}|Z)?$/i;

/** A day on its own, with nothing after it: "2026-11-14". */
const WRITTEN_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** The CMS labels of the two event fields that carry a time of day. */
const EVENT_DATE_FIELDS: ReadonlyArray<readonly [key: string, label: string]> = [
  ['startDate', 'Start date and time'],
  ['endDate', 'End date and time'],
];

/**
 * The instant a written day and time names, reading its numbers as Kigali's
 * however the file marks them. Null when the value is not a day plus a time of
 * day at all — a bare day, or something that is not a date — because those have
 * their own messages and inventing an hour for them would hide the mistake.
 */
export function kigaliInstant(written: string): Date | null {
  const match = WRITTEN_DATE_TIME.exec(written.trim());
  if (!match) return null;
  return new Date(`${match[1]}T${match[2]}${KIGALI_UTC_OFFSET}`);
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
 * The event's own fields, with the start and end replaced by the instants their
 * written numbers name in Kigali. Called on the raw data on its way into the
 * schema, so that everything downstream — the end-after-start check, the page,
 * the structured data — works on the instant the volunteer meant.
 *
 * A value this cannot read is passed through untouched, so the check or the
 * schema rule that speaks for it still gets to.
 */
export function withKigaliEventTimes<T extends Record<string, unknown>>(data: T, source: string): T {
  const frontmatter = frontmatterOf(source);
  const onKigaliTime: Record<string, unknown> = { ...data };
  for (const [key] of EVENT_DATE_FIELDS) {
    const instant = kigaliInstant(writtenValue(frontmatter, key));
    if (instant) onKigaliTime[key] = instant;
  }
  return onKigaliTime as T;
}

/**
 * The CMS labels of the date fields in this file that carry a day and no time
 * of day. Refusing these is right — the website prints the hour an event starts
 * and a day on its own does not carry one — and the remedy is to pick a time,
 * which the CMS calendar does.
 */
export function missingTimeOfDayFields(source: string): string[] {
  const frontmatter = frontmatterOf(source);
  return EVENT_DATE_FIELDS.filter(([key]) => WRITTEN_DATE_ONLY.test(writtenValue(frontmatter, key))).map(
    ([, label]) => label,
  );
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

/** The build-failure message for an event given a day but no time of day. */
export function missingTimeOfDayMessage(eventTitle: string, labels: ReadonlyArray<string>): string {
  return `${aboutTheEvent(eventTitle, labels)} ${MISSING_TIME_OF_DAY_MESSAGE}`;
}
