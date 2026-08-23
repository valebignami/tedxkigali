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

/** The words on the booking button when nobody has written any of their own. */
export const DEFAULT_BOOKING_LABEL = 'Book your seat';

/**
 * The words to print on an event's booking button.
 *
 * The button is a red block of colour whose only content is this text, on the
 * event page and on every card that lists the event, so a blank one is a link
 * with no accessible name on the site's most important call to action. Nothing
 * else on the page says what it does.
 *
 * Blank is not something the CMS itself can save: a field emptied there is
 * dropped from the file on its way to GitHub, and the schema's default takes
 * over — which is why "empty the field" is honest advice to give a volunteer.
 * A single space left behind survives that, and a file edited by hand never
 * passes through the form at all. Both land here.
 */
export function bookingButtonLabel(written: string | undefined): string {
  return written?.trim() || DEFAULT_BOOKING_LABEL;
}
