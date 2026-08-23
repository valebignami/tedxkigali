import { describe, expect, it } from 'vitest';
import { eventMapUrl, mapSearchUrl } from '~/lib/maps';

describe('mapSearchUrl', () => {
  it('builds a query from venue and address, separated by a comma and space', () => {
    expect(mapSearchUrl('Kigali Convention Centre', 'KG 2 Roundabout, Kigali, Rwanda')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Kigali%20Convention%20Centre%2C%20KG%202%20Roundabout%2C%20Kigali%2C%20Rwanda',
    );
  });

  it('falls back to the venue alone when address is absent', () => {
    expect(mapSearchUrl('Kigali Public Library')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Kigali%20Public%20Library',
    );
  });

  it('treats a whitespace-only address as absent', () => {
    expect(mapSearchUrl('Kigali Public Library', '   ')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Kigali%20Public%20Library',
    );
  });

  it('trims surrounding whitespace from venue and address before composing the query', () => {
    expect(mapSearchUrl('  Kigali Public Library  ', '  KG 9 Avenue  ')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Kigali%20Public%20Library%2C%20KG%209%20Avenue',
    );
  });

  it('percent-encodes characters that are not safe in a URL, not left raw', () => {
    expect(mapSearchUrl('Bar & Grill #2', 'Café')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Bar%20%26%20Grill%20%232%2C%20Caf%C3%A9',
    );
  });
});

describe('eventMapUrl', () => {
  it('returns the editor-set mapUrl unchanged when present', () => {
    expect(
      eventMapUrl({
        venue: 'Kigali Convention Centre',
        address: 'KG 2 Roundabout, Kigali, Rwanda',
        mapUrl: 'https://maps.app.goo.gl/abc123',
      }),
    ).toBe('https://maps.app.goo.gl/abc123');
  });

  it('falls back to a search url built from venue and address when mapUrl is absent', () => {
    expect(
      eventMapUrl({ venue: 'Kigali Convention Centre', address: 'KG 2 Roundabout, Kigali, Rwanda' }),
    ).toBe(mapSearchUrl('Kigali Convention Centre', 'KG 2 Roundabout, Kigali, Rwanda'));
  });

  it('treats a whitespace-only mapUrl as absent', () => {
    expect(eventMapUrl({ venue: 'Kigali Public Library', mapUrl: '   ' })).toBe(
      mapSearchUrl('Kigali Public Library'),
    );
  });
});
