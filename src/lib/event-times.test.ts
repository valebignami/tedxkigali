import { describe, expect, it } from 'vitest';
import {
  kigaliInstant,
  missingTimeOfDayFields,
  missingTimeOfDayMessage,
  withKigaliEventTimes,
  writtenEventTitle,
} from '~/lib/event-times';

// 09:00 in Kigali, every day of the year, is 07:00 UTC.
const NINE_IN_KIGALI = '2026-11-14T07:00:00.000Z';

describe('kigaliInstant', () => {
  // The point of the whole change: whatever offset marker the file carries, the
  // numbers on the clock are Kigali's. Pages CMS stamps +00:00 on whatever the
  // editor picked; a file written by hand before this change carries +02:00;
  // the CMS now writes neither. All three say 09:00 and mean 09:00 in Kigali.
  it.each([
    ['the offset Pages CMS stamps on everything', '2026-11-14T09:00:00+00:00'],
    ['the offset older hand-written files carry', '2026-11-14T09:00:00+02:00'],
    ['no offset at all, which is what the CMS writes now', '2026-11-14T09:00:00'],
    ['a Z from a machine set to UTC', '2026-11-14T09:00:00Z'],
    ['an offset from a laptop in New York', '2026-11-14T09:00:00-05:00'],
    ['an offset written without its colon', '2026-11-14T09:00:00+0000'],
    ['a space where YAML allows one instead of the T', '2026-11-14 09:00:00 +01:00'],
    ['no seconds', '2026-11-14T09:00+00:00'],
    ['fractional seconds', '2026-11-14T09:00:00.000+00:00'],
  ])('reads %s as Kigali time', (_why, written) => {
    expect(kigaliInstant(written)?.toISOString()).toBe(NINE_IN_KIGALI);
  });

  it('gives one and the same instant for every offset form', () => {
    const instants = ['+00:00', '+02:00', '', 'Z', '-05:00'].map(
      (offset) => kigaliInstant(`2026-11-14T09:00:00${offset}`)?.getTime(),
    );
    expect(new Set(instants).size).toBe(1);
  });

  // Rwanda keeps one offset all year, so a fixed one is exact in July as well
  // as in January — see the note on KIGALI_UTC_OFFSET.
  it('reads a July time the same way as a November one', () => {
    expect(kigaliInstant('2026-07-14T09:00:00+00:00')?.toISOString()).toBe('2026-07-14T07:00:00.000Z');
  });

  it.each([
    ['a day with no time on it', '2026-11-14'],
    ['something that is not a date', 'next Friday'],
    ['an empty value', ''],
  ])('returns nothing for %s, leaving it to the checks that name it', (_why, written) => {
    expect(kigaliInstant(written)).toBeNull();
  });
});

const eventFile = (start: string, end?: string) =>
  [
    '---',
    'title: "TEDxKigali 2026 — Rising"',
    `startDate: ${start}`,
    ...(end ? [`endDate: ${end}`] : []),
    'venue: "Kigali Convention Centre"',
    '---',
    '',
    'Body.',
  ].join('\n');

// What the YAML parser hands over: a bare or +00:00 time becomes an instant two
// hours early, because the parser reads an unmarked time as UTC.
const asYamlRead = (written: string) => new Date(`${written.replace(/\+00:00$/, '')}Z`);

describe('withKigaliEventTimes', () => {
  it('moves a start the CMS stamped +00:00 onto Kigali time', () => {
    const source = eventFile('2026-11-14T09:00:00+00:00');
    const data = { title: 'Rising', startDate: asYamlRead('2026-11-14T09:00:00+00:00') };
    expect((withKigaliEventTimes(data, source).startDate as Date).toISOString()).toBe(NINE_IN_KIGALI);
  });

  it('leaves a start already written on Kigali time where it is', () => {
    const source = eventFile('2026-11-14T09:00:00+02:00');
    const data = { startDate: new Date(NINE_IN_KIGALI) };
    expect((withKigaliEventTimes(data, source).startDate as Date).toISOString()).toBe(NINE_IN_KIGALI);
  });

  it('reads the end time as well as the start', () => {
    const source = eventFile('2026-11-14T09:00:00', '2026-11-14T18:00:00');
    const data = {
      startDate: asYamlRead('2026-11-14T09:00:00'),
      endDate: asYamlRead('2026-11-14T18:00:00'),
    };
    const fixed = withKigaliEventTimes(data, source);
    expect((fixed.startDate as Date).toISOString()).toBe(NINE_IN_KIGALI);
    expect((fixed.endDate as Date).toISOString()).toBe('2026-11-14T16:00:00.000Z');
  });

  it('adds no end time to an event that has none', () => {
    const fixed = withKigaliEventTimes({ startDate: new Date(NINE_IN_KIGALI) }, eventFile('2026-11-14T09:00:00'));
    expect('endDate' in fixed).toBe(false);
  });

  it('leaves every other field exactly as it was', () => {
    const source = eventFile('2026-11-14T09:00:00+00:00');
    const data = { title: 'Rising', venue: 'KCC', startDate: asYamlRead('2026-11-14T09:00:00+00:00') };
    const fixed = withKigaliEventTimes(data, source);
    expect(fixed.title).toBe('Rising');
    expect(fixed.venue).toBe('KCC');
  });

  it('returns a new object rather than editing the one it was given', () => {
    const data = { startDate: asYamlRead('2026-11-14T09:00:00+00:00') };
    const before = (data.startDate as Date).toISOString();
    withKigaliEventTimes(data, eventFile('2026-11-14T09:00:00+00:00'));
    expect((data.startDate as Date).toISOString()).toBe(before);
  });

  // Both of these have their own message. Touching the value here would hide
  // the mistake behind an hour the editor never typed.
  it('leaves a day with no time of day for the check that names it', () => {
    const parsed = new Date('2026-11-14T00:00:00.000Z');
    expect(withKigaliEventTimes({ startDate: parsed }, eventFile('2026-11-14')).startDate).toBe(parsed);
  });

  it('leaves something that is not a date at all for the schema to refuse', () => {
    expect(withKigaliEventTimes({ startDate: 'next Friday' }, eventFile('next Friday')).startDate).toBe(
      'next Friday',
    );
  });

  // A programme row's "time" is a string like "09:00" indented under schedule:,
  // and must never be mistaken for the event's own start.
  it('does not read the times inside the programme rows', () => {
    const source = [
      '---',
      'title: "TEDxKigali 2026 — Rising"',
      'startDate: 2026-11-14T09:00:00',
      'schedule:',
      '  - time: "08:00"',
      '    title: "Doors open"',
      '---',
      '',
    ].join('\n');
    expect((withKigaliEventTimes({ startDate: new Date(0) }, source).startDate as Date).toISOString()).toBe(
      NINE_IN_KIGALI,
    );
  });

  it('reads a quoted value as well as a bare one', () => {
    const source = eventFile('"2026-11-14T09:00:00+00:00"');
    expect((withKigaliEventTimes({ startDate: new Date(0) }, source).startDate as Date).toISOString()).toBe(
      NINE_IN_KIGALI,
    );
  });
});

describe('missingTimeOfDayFields', () => {
  it('finds nothing wrong with a full date and time', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14T09:00:00'))).toEqual([]);
  });

  it('names a start that is a day with no time on it', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14'))).toEqual(['Start date and time']);
  });

  it('names an end that is a day with no time on it', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14T09:00:00', '2026-11-15'))).toEqual([
      'End date and time',
    ]);
  });

  it('names both fields when both are days with no time on them', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14', '2026-11-15'))).toEqual([
      'Start date and time',
      'End date and time',
    ]);
  });

  it('leaves something that is not a date at all to the schema', () => {
    expect(missingTimeOfDayFields(eventFile('next Friday'))).toEqual([]);
  });
});

describe('missingTimeOfDayMessage', () => {
  it('names the event and the field, and asks for a time of day', () => {
    const message = missingTimeOfDayMessage('TEDxKigali 2026 — Rising', ['Start date and time']);
    expect(message).toContain('TEDxKigali 2026 — Rising');
    expect(message).toContain('"Start date and time"');
    expect(message).toMatch(/time of day/i);
    // Nothing about the clock on the editor's computer: it no longer matters,
    // and moving it was a remedy that never worked.
    expect(message).not.toMatch(/clock on your computer|time zone/i);
  });

  it('opens with a whole sentence, not a fragment', () => {
    const [opening] = missingTimeOfDayMessage('TEDxKigali 2026', ['Start date and time']).split('. ');
    expect(opening).toMatch(/\b(has|have|is|are|was|were)\b/);
  });
});

describe('writtenEventTitle', () => {
  it('reads the title the editor typed', () => {
    expect(writtenEventTitle(eventFile('2026-11-14T09:00:00'))).toBe('TEDxKigali 2026 — Rising');
  });
});
