import { describe, expect, it } from 'vitest';
import {
  BOOKING_URL_MESSAGE,
  DEFAULT_BOOKING_LABEL,
  bookingButtonLabel,
  requiresBookingUrl,
} from '~/lib/content-rules';

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

// A booking button with nothing written on it is a red block of colour linking
// off the site, with no accessible name, on the page that matters most. The CMS
// itself cannot produce one — a field emptied there is dropped from the file on
// its way to GitHub, so the default takes over — but a space left behind in it
// survives that, and a file edited by hand never passes the CMS at all.
describe('bookingButtonLabel', () => {
  it('keeps the words the editor wrote', () => {
    expect(bookingButtonLabel('Register now')).toBe('Register now');
  });

  it('trims the words the editor wrote', () => {
    expect(bookingButtonLabel('  Register now  ')).toBe('Register now');
  });

  it('falls back to the default when the field is missing', () => {
    expect(bookingButtonLabel(undefined)).toBe(DEFAULT_BOOKING_LABEL);
  });

  it('falls back to the default when the field holds nothing but spaces', () => {
    expect(bookingButtonLabel('   ')).toBe(DEFAULT_BOOKING_LABEL);
    expect(bookingButtonLabel('')).toBe(DEFAULT_BOOKING_LABEL);
  });

  it('has words in the default itself', () => {
    expect(DEFAULT_BOOKING_LABEL.trim().length).toBeGreaterThan(0);
  });
});
