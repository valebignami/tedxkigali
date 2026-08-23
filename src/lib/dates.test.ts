import { describe, expect, it } from 'vitest';
import { formatEventDate } from '~/lib/dates';

describe('formatEventDate', () => {
  it('renders a known instant in Kigali time', () => {
    expect(formatEventDate(new Date('2026-11-14T09:00:00+02:00'))).toBe(
      'Saturday, 14 November 2026 at 09:00',
    );
  });

  // The same instant written with a different offset must render identically:
  // the formatter must depend on the instant, never on how it was typed or on
  // the machine the build runs on.
  it('ignores the offset the instant was written with', () => {
    const written = ['2026-11-14T09:00:00+02:00', '2026-11-14T07:00:00Z', '2026-11-14T02:00:00-05:00'];
    const rendered = written.map((value) => formatEventDate(new Date(value)));
    expect(new Set(rendered).size).toBe(1);
  });

  // 22:30 UTC is already the next day in Kigali. A formatter that fell back to
  // the machine time zone would print 14 November on a UTC build machine.
  it('rolls over the date at Kigali midnight, not at UTC midnight', () => {
    expect(formatEventDate(new Date('2026-11-14T22:30:00Z'))).toBe(
      'Sunday, 15 November 2026 at 00:30',
    );
  });
});
