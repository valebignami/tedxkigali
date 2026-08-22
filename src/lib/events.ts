export type EventState = 'upcoming' | 'live' | 'past';

// Single source of truth: the Zod enum in src/content.config.ts is built from
// this array, so adding a status here is enough to make it valid content.
export const TICKET_STATUSES = ['coming-soon', 'open', 'free', 'sold-out', 'closed'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** Events without an explicit end time are assumed to last four hours. */
export const DEFAULT_EVENT_DURATION_MS = 4 * 60 * 60 * 1000;

const ON_SALE: ReadonlySet<TicketStatus> = new Set<TicketStatus>(['open', 'free']);

const TICKET_LABELS: Record<TicketStatus, string> = {
  'coming-soon': 'Tickets coming soon',
  open: 'Tickets on sale',
  free: 'Free entry — registration required',
  'sold-out': 'Sold out',
  closed: 'Registrations closed',
};

export function eventEnd(start: Date, end?: Date | null): Date {
  if (end && end.getTime() > start.getTime()) return end;
  return new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
}

export function eventState(start: Date, end: Date | null | undefined, now: Date): EventState {
  if (now.getTime() < start.getTime()) return 'upcoming';
  if (now.getTime() <= eventEnd(start, end).getTime()) return 'live';
  return 'past';
}

export function isBookable(state: EventState, ticketStatus: TicketStatus): boolean {
  return state !== 'past' && ON_SALE.has(ticketStatus);
}

export function ticketStatusLabel(status: TicketStatus): string {
  return TICKET_LABELS[status];
}
