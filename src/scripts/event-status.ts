// The site is static: an event could otherwise stay "upcoming" until the next
// build. This re-checks every card against the visitor's clock on page load.
//
// The duration is imported, never re-declared: the build stamps data-event-end
// with it and this script falls back to it, so two copies drifting apart would
// make the page disagree with itself about when an event ends.
import { DEFAULT_EVENT_DURATION_MS } from '~/lib/events';

const upcoming = document.querySelector<HTMLElement>('#events-upcoming');
const past = document.querySelector<HTMLElement>('#events-past');

function endOf(card: HTMLElement, start: number): number {
  const raw = card.dataset.eventEnd;
  const end = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(end) && end > start ? end : start + DEFAULT_EVENT_DURATION_MS;
}

function refresh(): void {
  const now = Date.now();

  document.querySelectorAll<HTMLElement>('article[data-event]').forEach((card) => {
    const start = Date.parse(card.dataset.eventStart ?? '');
    if (!Number.isFinite(start)) return;

    const state = now < start ? 'upcoming' : now <= endOf(card, start) ? 'live' : 'past';
    card.dataset.eventState = state;

    const badge = card.querySelector<HTMLElement>('[data-live-badge]');
    if (badge) badge.hidden = state !== 'live';

    const booking = card.querySelector<HTMLAnchorElement>('[data-booking]');
    if (booking && state === 'past') booking.remove();

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
