// Every date a visitor reads goes through here. The time zone is pinned to
// Africa/Kigali on purpose: the build runs on a CI machine in UTC, so an
// unpinned formatter would print "18:00" for an event that starts at 20:00 in
// Kigali, and the site would disagree with the poster on the wall.
const EVENT_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Kigali',
});

/** The date and time of an event, as a clock in Kigali would show it. */
export function formatEventDate(date: Date): string {
  return EVENT_DATE_FORMAT.format(date);
}
