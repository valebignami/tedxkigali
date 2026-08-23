import type { TicketStatus } from '~/lib/events';

// Every long text field in the CMS shares this limit, so the number is written
// once: the schemas, the message the editor reads and the field descriptions in
// .pages.yml all have to agree, and only the last of those cannot import it.
export const MAX_TEXT_LENGTH = 300;

export const BOOKING_URL_MESSAGE =
  'A booking link is required when the ticket status is "Tickets on sale" or ' +
  '"Free entry". Paste the link from your ticketing platform, or change the ticket status.';

export function requiresBookingUrl(status: TicketStatus): boolean {
  return status === 'open' || status === 'free';
}

/**
 * Shown when an entry carries a field the website does not read. Quoting the
 * stored word is the point of this one: it is what a CMS form and the website
 * look like once they have drifted apart, and the word is the only thing that
 * says where they parted.
 */
export function unknownFieldMessage(keys: ReadonlyArray<PropertyKey>): string {
  const named = keys.map((key) => `"${String(key)}"`).join(', ');
  return (
    `This entry holds something the website does not read: ${named}. Nothing on ` +
    'the site will ever show it, so take it out — and if it was meant to appear ' +
    'somewhere, the site maintainer has to add the field to the form first.'
  );
}
