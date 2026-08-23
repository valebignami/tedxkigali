// Editor-facing validation messages, kept in one place because spec §4.2 makes
// their wording binding: a volunteer meets them in the CMS or in the email the
// failed build sends, never in a stack trace. They must say what to do next and
// must not name a field by its code name — the CMS shows "Booking link",
// "Map link", "Website", never bookingUrl, mapUrl or url.

/**
 * Shown when a link is not a complete web address. The likeliest mistake by far
 * is copying "www.eventbrite.com/e/12345" without the scheme, so the message
 * names the fix rather than the rule.
 */
export const WEB_ADDRESS_MESSAGE =
  'This does not look like a complete web address. Copy the whole link from ' +
  "your browser's address bar — it must start with https://";
