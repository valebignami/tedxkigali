import { describe, expect, it } from 'vitest';
import {
  isOnKigaliTime,
  missingTimeOfDayFields,
  missingTimeOfDayMessage,
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

  // Not in this list: +02:00 written from Brussels in July. CEST is the same
  // offset as CAT, so that value names the right instant wherever it was typed
  // and passes — correctly. The check is on the offset, not on where the laptop
  // was, which is why an offset nobody's clock is really on is used below to
  // stand for "a minute out".
  it.each([
    ['a European winter laptop', '2026-11-14T09:00:00+01:00'],
    ['an offset a minute away from Kigali', '2026-11-14T09:00:00+02:01'],
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

describe('missingTimeOfDayFields', () => {
  it('finds nothing wrong with a full date and time', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14T09:00:00+02:00'))).toEqual([]);
  });

  it('names a start that is a day with no time on it', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14'))).toEqual(['Start date and time']);
  });

  it('names an end that is a day with no time on it', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14T09:00:00+02:00', '2026-11-15'))).toEqual([
      'End date and time',
    ]);
  });

  // A wrong time zone is a different mistake with a different remedy, so the
  // two lists never hold the same field and never contradict each other.
  it('leaves a wrong time zone to the time-zone check', () => {
    expect(missingTimeOfDayFields(eventFile('2026-11-14T09:00:00+01:00'))).toEqual([]);
  });

  it('leaves something that is not a date at all to the time-zone check', () => {
    expect(missingTimeOfDayFields(eventFile('next Friday'))).toEqual([]);
  });
});

describe('offKigaliTimeFields, against a day with no time on it', () => {
  it('says nothing, because the other check has already named it', () => {
    expect(offKigaliTimeFields(eventFile('2026-11-14'))).toEqual([]);
  });
});

describe('missingTimeOfDayMessage', () => {
  it('names the event and the field, and asks for a time of day', () => {
    const message = missingTimeOfDayMessage('TEDxKigali 2026 — Rising', ['Start date and time']);
    expect(message).toContain('TEDxKigali 2026 — Rising');
    expect(message).toContain('"Start date and time"');
    expect(message).toMatch(/time of day/i);
    // The remedy for a wrong time zone is not the remedy for this.
    expect(message).not.toMatch(/set the clock on your computer/i);
  });

  it('opens with a whole sentence, not a fragment', () => {
    const [opening] = missingTimeOfDayMessage('TEDxKigali 2026', ['Start date and time']).split('. ');
    expect(opening).toMatch(/\b(has|have|is|are|was|were)\b/);
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

  // It used to open "The event "X", in "Start date and time"." — a clause with
  // no verb in it, which is the first thing a second-language reader meets.
  it('opens with a whole sentence, not a fragment', () => {
    const [opening] = offKigaliTimeMessage('TEDxKigali 2026', ['Start date and time']).split('. ');
    expect(opening).toMatch(/\b(has|have|is|are|was|were)\b/);
  });
});
