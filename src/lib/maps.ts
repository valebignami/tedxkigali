// The ?api=1 form is the one Google documents as stable: the shortened
// maps.app.goo.gl links an editor might paste are not guaranteed to keep
// working, but this search URL shape is.
const MAPS_SEARCH_BASE = 'https://www.google.com/maps/search/?api=1&query=';

function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Google Maps search link for a place, built from what the editor typed. */
export function mapSearchUrl(venue: string, address?: string): string {
  const query = [present(venue), present(address)].filter(Boolean).join(', ');
  return MAPS_SEARCH_BASE + encodeURIComponent(query);
}

/** The map link for an event: the editor's own link when they set one,
    otherwise a search built from venue and address. */
export function eventMapUrl(input: { venue: string; address?: string; mapUrl?: string }): string {
  return present(input.mapUrl) ?? mapSearchUrl(input.venue, input.address);
}
