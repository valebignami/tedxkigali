import type { TicketStatus } from '~/lib/events';

export const BOOKING_URL_MESSAGE =
  'A booking link is required when the ticket status is "Tickets on sale" or ' +
  '"Free entry". Paste the link from your ticketing platform, or change the ticket status.';

export function requiresBookingUrl(status: TicketStatus): boolean {
  return status === 'open' || status === 'free';
}
