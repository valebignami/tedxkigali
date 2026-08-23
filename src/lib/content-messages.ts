// Editor-facing validation messages, kept in one place because spec §4.2 makes
// their wording binding: a volunteer meets them in the CMS or in the email the
// failed build sends, never in a stack trace. They must say what to do next and
// must not name a field by its code name — the CMS shows "Booking link",
// "Exact map link (optional)", "Website", never bookingUrl, mapUrl or url.

/**
 * Shown when a link is not a complete web address. The likeliest mistake by far
 * is copying "www.eventbrite.com/e/12345" without the scheme, so the message
 * names the fix rather than the rule.
 */
export const WEB_ADDRESS_MESSAGE =
  'This does not look like a complete web address. Copy the whole link from ' +
  "your browser's address bar — it must start with https://";

/** Shown when a tag row was left blank, which renders a nameless button. */
export const TAG_EMPTY_MESSAGE =
  'One of the tags is empty. Delete that row, or type a word into it: an empty ' +
  'tag shows on the talks page as a button with nothing written on it.';

/**
 * Shown when a tag contains the character the talks page uses to separate one
 * tag from the next. A tag containing it would disappear from its own filter.
 */
export const TAG_SEPARATOR_MESSAGE =
  'A tag cannot contain the "|" character, because the talks page uses it to ' +
  'separate one tag from the next. Write two tags instead, for example ' +
  '"climate" and "policy".';

/** Shown when a programme row was left without a "What happens" entry. */
export const SCHEDULE_TITLE_MESSAGE =
  'One of the programme rows has nothing written in "What happens". Either ' +
  'describe what happens at that point in the day, or delete the row.';

/**
 * Shown when a programme row's time cannot be understood. The rest of the
 * website prints times on a 24-hour clock, so the message spells out the
 * exact format rather than naming the rule it broke.
 */
export const SCHEDULE_TIME_MESSAGE =
  'This time is not in the right format. Use 24-hour time like "09:00", or a ' +
  'range like "09:00 - 09:20".';
