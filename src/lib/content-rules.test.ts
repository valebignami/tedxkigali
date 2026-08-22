import { describe, expect, it } from 'vitest';
import { BOOKING_URL_MESSAGE, requiresBookingUrl } from '~/lib/content-rules';

describe('requiresBookingUrl', () => {
  it('requires a booking link when tickets are on sale', () => {
    expect(requiresBookingUrl('open')).toBe(true);
    expect(requiresBookingUrl('free')).toBe(true);
  });

  it('does not require one otherwise', () => {
    expect(requiresBookingUrl('coming-soon')).toBe(false);
    expect(requiresBookingUrl('sold-out')).toBe(false);
    expect(requiresBookingUrl('closed')).toBe(false);
  });
});

describe('BOOKING_URL_MESSAGE', () => {
  it('tells the editor exactly what to do', () => {
    expect(BOOKING_URL_MESSAGE).toMatch(/booking link/i);
    expect(BOOKING_URL_MESSAGE).toMatch(/Tickets on sale|Free entry/i);
  });
});
