import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EVENT_DURATION_MS,
  PAST_EVENT_TICKET_LABEL,
  TICKET_STATUSES,
  eventEnd,
  eventState,
  isBookable,
  ticketStatusLabel,
  ticketStatusLine,
} from '~/lib/events';

// All fixtures use the Africa/Kigali offset (+02:00) written explicitly,
// so the tests are independent of the machine timezone.
const start = new Date('2026-11-14T09:00:00+02:00');
const end = new Date('2026-11-14T18:00:00+02:00');

describe('eventEnd', () => {
  it('uses the explicit end date when present', () => {
    expect(eventEnd(start, end).toISOString()).toBe(end.toISOString());
  });

  it('defaults to four hours after the start', () => {
    expect(eventEnd(start).getTime()).toBe(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  });

  it('ignores an end date that precedes the start', () => {
    const broken = new Date('2026-11-13T09:00:00+02:00');
    expect(eventEnd(start, broken).getTime()).toBe(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  });
});

describe('eventState', () => {
  it('is upcoming before the start', () => {
    expect(eventState(start, end, new Date('2026-11-13T23:59:00+02:00'))).toBe('upcoming');
  });

  it('is live between start and end', () => {
    expect(eventState(start, end, new Date('2026-11-14T12:00:00+02:00'))).toBe('live');
  });

  it('is live exactly at the start', () => {
    expect(eventState(start, end, start)).toBe('live');
  });

  // The decisive boundary: at this exact instant the booking button must still
  // be there, one millisecond later it must be gone. Without both assertions,
  // flipping <= to < would pass the whole suite.
  it('is still live at the exact end instant', () => {
    expect(eventState(start, end, end)).toBe('live');
  });

  it('is past one millisecond after the end instant', () => {
    expect(eventState(start, end, new Date(end.getTime() + 1))).toBe('past');
  });

  it('is past after the end', () => {
    expect(eventState(start, end, new Date('2026-11-14T18:00:01+02:00'))).toBe('past');
  });

  it('is past just after midnight in Kigali when the event ended the day before', () => {
    expect(eventState(start, end, new Date('2026-11-15T00:30:00+02:00'))).toBe('past');
  });

  it('falls back to the default duration when no end date is given', () => {
    expect(eventState(start, null, new Date('2026-11-14T12:00:00+02:00'))).toBe('live');
    expect(eventState(start, null, new Date('2026-11-14T13:30:00+02:00'))).toBe('past');
  });

  it('applies the same end boundary to the default duration', () => {
    const defaultEnd = new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
    expect(eventState(start, null, defaultEnd)).toBe('live');
    expect(eventState(start, null, new Date(defaultEnd.getTime() + 1))).toBe('past');
  });

  it('stays past well after a malformed end date that precedes the start', () => {
    const broken = new Date('2026-11-13T09:00:00+02:00');
    expect(eventState(start, broken, new Date('2026-11-14T10:00:00+02:00'))).toBe('live');
    expect(eventState(start, broken, new Date('2026-11-15T00:30:00+02:00'))).toBe('past');
  });
});

describe('isBookable', () => {
  it('allows booking for upcoming events with tickets on sale', () => {
    expect(isBookable('upcoming', 'open')).toBe(true);
    expect(isBookable('upcoming', 'free')).toBe(true);
  });

  it('blocks booking once the event is over', () => {
    expect(isBookable('past', 'open')).toBe(false);
  });

  it('blocks booking for statuses that are not on sale', () => {
    expect(isBookable('upcoming', 'sold-out')).toBe(false);
    expect(isBookable('upcoming', 'coming-soon')).toBe(false);
    expect(isBookable('upcoming', 'closed')).toBe(false);
  });

  it('still allows booking while the event is live', () => {
    expect(isBookable('live', 'open')).toBe(true);
  });
});

describe('ticketStatusLine', () => {
  it('shows the ticket status while the event has not ended', () => {
    expect(ticketStatusLine('upcoming', 'open')).toBe('Tickets on sale');
    expect(ticketStatusLine('live', 'open')).toBe('Tickets on sale');
    expect(ticketStatusLine('upcoming', 'sold-out')).toBe('Sold out');
  });

  // The whole point of the line: a page built while tickets were on sale must
  // never still read "Tickets on sale" once the event is over.
  it('replaces every ticket status once the event is past', () => {
    for (const status of TICKET_STATUSES) {
      expect(ticketStatusLine('past', status)).toBe(PAST_EVENT_TICKET_LABEL);
    }
  });

  it('has a past-event label that says the event is over', () => {
    expect(PAST_EVENT_TICKET_LABEL.trim()).not.toBe('');
    expect(PAST_EVENT_TICKET_LABEL).toMatch(/ended/i);
  });
});

describe('ticketStatusLabel', () => {
  it('returns editor-facing English labels', () => {
    expect(ticketStatusLabel('coming-soon')).toBe('Tickets coming soon');
    expect(ticketStatusLabel('open')).toBe('Tickets on sale');
    expect(ticketStatusLabel('free')).toBe('Free entry — registration required');
    expect(ticketStatusLabel('sold-out')).toBe('Sold out');
    expect(ticketStatusLabel('closed')).toBe('Registrations closed');
  });
});
