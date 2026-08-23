// The site is static: an event could otherwise stay "upcoming" until the next
// build. This re-checks every card against the visitor's clock on page load.
//
// eventState is imported, never re-implemented. Its tests were hardened around
// the exact end instant, and a second copy of that comparison here would let a
// <= turned into a < ship with a green suite — the booking button would vanish
// a millisecond early, or linger, with nothing to catch it.
import { eventState, PAST_EVENT_TICKET_LABEL } from '~/lib/events';

const upcoming = document.querySelector<HTMLElement>('#events-upcoming');
const past = document.querySelector<HTMLElement>('#events-past');

function refresh(): void {
  const now = new Date();

  document.querySelectorAll<HTMLElement>('article[data-event]').forEach((card) => {
    const start = new Date(card.dataset.eventStart ?? '');
    if (Number.isNaN(start.getTime())) return;

    // An unparsable or missing end date becomes null, which is what eventEnd
    // inside eventState turns into the default duration.
    const rawEnd = card.dataset.eventEnd;
    const end = rawEnd ? new Date(rawEnd) : null;

    const state = eventState(start, end, now);
    card.dataset.eventState = state;

    const badge = card.querySelector<HTMLElement>('[data-live-badge]');
    if (badge) badge.hidden = state !== 'live';

    const booking = card.querySelector<HTMLAnchorElement>('[data-booking]');
    if (booking && state === 'past') booking.remove();

    // Removing the button is not enough: a page built while tickets were on
    // sale still carries that sentence, so the ticket line and the note about
    // the external ticketing site have to go with it.
    if (state === 'past') {
      card.querySelectorAll<HTMLElement>('[data-ticket-status-label]').forEach((label) => {
        label.textContent = PAST_EVENT_TICKET_LABEL;
      });
      card.querySelectorAll<HTMLElement>('[data-booking-note]').forEach((note) => note.remove());
    }

    if (state === 'past' && past && card.parentElement !== past) past.prepend(card);
    if (state !== 'past' && upcoming && card.parentElement !== upcoming) upcoming.append(card);
  });

  // Any page can host event cards outside the events index — the home page's
  // "Next event" block does. Such a section hides itself once every card in it
  // has passed, so the home never announces a finished event as the next one.
  document.querySelectorAll<HTMLElement>('[data-event-section]').forEach((section) => {
    const live = section.querySelectorAll('article[data-event]:not([data-event-state="past"])');
    section.hidden = live.length === 0;
  });

  toggleSection('#events-upcoming-section', upcoming);
  toggleSection('#events-past-section', past);

  // The empty-state paragraph is the inverse of the upcoming section: if every
  // event turned out to be over, the page must say so rather than showing
  // nothing but the archive.
  const none = document.querySelector<HTMLElement>('#events-none');
  if (none && upcoming) none.hidden = upcoming.children.length > 0;
}

function toggleSection(selector: string, list: HTMLElement | null): void {
  const section = document.querySelector<HTMLElement>(selector);
  if (section && list) section.hidden = list.children.length === 0;
}

refresh();
