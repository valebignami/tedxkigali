import { describe, expect, it } from 'vitest';
import {
  isOnKigaliTime,
  offKigaliTimeFields,
  offKigaliTimeMessage,
  writtenEventTitle,
} from '~/lib/event-times';

describe('isOnKigaliTime', () => {
  it.each([
    '2026-11-14T09:00:00+02:00',
    '2026-11-14T09:00+02:00',
    '2026-11-14T09:00:00.000+02:00',
    '2026-11-14T09:00:00+0200',
    '2026-11-14 09:00:00 +02:00',
  ])('accepts %s', (written) => {
    expect(isOnKigaliTime(written)).toBe(true);
  });

  it.each([
    ['a European winter laptop', '2026-11-14T09:00:00+01:00'],
    ['a European summer laptop', '2026-11-14T09:00:00+02:01'],
    ['a laptop in New York', '2026-11-14T09:00:00-05:00'],
    ['a machine set to UTC', '2026-11-14T09:00:00Z'],
    ['no time zone at all, which YAML reads as UTC', '2026-11-14T09:00:00'],
    ['a day with no time on it', '2026-11-14'],
    ['something that is not a date', 'next Friday'],
  ])('rejects %s', (_why, written) => {
    expect(isOnKigaliTime(written)).toBe(false);
  });
});

const eventFile = (start: string, end?: string) =>
  ['---', 'title: "TEDxKigali 2026 — Rising"', `startDate: ${start}`, ...(end ? [`endDate: ${end}`] : []), 'venue: "Kigali Convention Centre"', '---', '', 'Body.'].join('\n');

describe('offKigaliTimeFields', () => {
  it('finds nothing wrong with an event written on Kigali time', () => {
    expect(offKigaliTimeFields(eventFile('2026-11-14T09:00:00+02:00', '2026-11-14T18:00:00+02:00'))).toEqual([]);
  });

  it('names the field, by the label the CMS shows', () => {
    expect(offKigaliTimeFields(eventFile('2026-11-14T09:00:00+01:00'))).toEqual(['Start date and time']);
  });

  it('names both fields when both are wrong', () => {
    expect(offKigaliTimeFields(eventFile('2026-11-14T09:00:00Z', '2026-11-14T18:00:00Z'))).toEqual([
      'Start date and time',
      'End date and time',
    ]);
  });

  // The end time is optional, and an event without one is not a mistake.
  it('ignores an end time that was never filled in', () => {
    expect(offKigaliTimeFields(eventFile('2026-11-14T09:00:00+02:00'))).toEqual([]);
  });

  it('reads a quoted value as well as a bare one', () => {
    expect(offKigaliTimeFields(eventFile('"2026-11-14T09:00:00+01:00"'))).toEqual(['Start date and time']);
  });

  // A programme row's "time" is a string like "09:00" and lives indented under
  // schedule:, so it must not be mistaken for the event's own start.
  it('ignores the times inside the programme rows', () => {
    const source = [
      '---',
      'title: "TEDxKigali 2026 — Rising"',
      'startDate: 2026-11-14T09:00:00+02:00',
      'schedule:',
      '  - time: "09:00"',
      '    title: "Doors open"',
      '---',
      '',
    ].join('\n');
    expect(offKigaliTimeFields(source)).toEqual([]);
  });
});

describe('writtenEventTitle', () => {
  it('reads the title the editor typed', () => {
    expect(writtenEventTitle(eventFile('2026-11-14T09:00:00+02:00'))).toBe('TEDxKigali 2026 — Rising');
  });
});

describe('offKigaliTimeMessage', () => {
  it('names the event and the fields, and says what to do', () => {
    const message = offKigaliTimeMessage('TEDxKigali 2026 — Rising', ['Start date and time']);
    expect(message).toContain('TEDxKigali 2026 — Rising');
    expect(message).toContain('"Start date and time"');
    expect(message).toMatch(/Kigali time/);
    expect(message).not.toMatch(/startDate|offset|UTC|\+02:00/);
  });
});
