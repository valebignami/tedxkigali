// Editor-facing validation messages, kept in one place because spec §4.2 makes
// their wording binding: a volunteer meets them in the CMS or in the email the
// failed build sends, never in a stack trace. They must say what to do next and
// must not name a field by its code name — the CMS shows "Booking link",
// "Exact map link", "Website", never bookingUrl, mapUrl or url.
//
// Astro prints a content message as "<code path>: <message>". There is a way to
// stop it — an issue carrying params.isHoistedAstroError makes Astro throw that
// one error by itself — but it throws that one and drops every other mistake in
// the same save, so a volunteer with three of them would fix them one failed
// build at a time. The prefix is the cheaper of the two. Each message therefore
// names on its own what it is about, so that it still reads as a whole sentence
// to a volunteer who skips past the prefix. src/lib/settings.ts is the one form
// where the whole message is ours to write.

import { MAX_TEXT_LENGTH } from '~/lib/content-rules';

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

/**
 * Shown when an event has no venue. Spaces alone count as no venue: the page
 * turns this text into the link that opens Google Maps, so a blank one leaves a
 * link with nothing written on it pointing at an empty search.
 */
export const VENUE_MESSAGE =
  'This event has no venue. Write the name of the place it happens, for ' +
  'example "Kigali Convention Centre" — the website builds the map link from it.';

/** Shown when a programme row was left without a "What happens" entry. */
export const SCHEDULE_TITLE_MESSAGE =
  'One of the programme rows has nothing written in "What happens". Either ' +
  'describe what happens at that point in the day, or delete the row.';

/**
 * Shown when a programme row's time cannot be understood. The rest of the
 * website prints times on a 24-hour clock, so the message spells out the exact
 * format rather than naming the rule it broke. It says "one of the rows"
 * because the only thing that says which row is the zero-counted position Astro
 * prints in front of it, and no form in the CMS numbers rows from zero.
 */
export const SCHEDULE_TIME_MESSAGE =
  'One of the programme rows has a time the website cannot read. Use 24-hour ' +
  'time like "09:00", or a range like "09:00 - 09:20".';

/** Shown when an event was saved without a title. */
export const EVENT_TITLE_MESSAGE =
  'This event has no title. Write the name of the edition, for example ' +
  '"TEDxKigali 2026 — Rising" — it is the heading of the whole event page.';

/** Shown when a talk was saved without a title. */
export const TALK_TITLE_MESSAGE =
  'This talk has no title. Write the title exactly as it was announced on ' +
  'stage — it is what visitors read on the talk card.';

/** Shown when a talk was saved without a speaker name. */
export const TALK_SPEAKER_MESSAGE =
  'This talk has nobody credited. Write the full name of the person who gave ' +
  'it, as it should appear under the video.';

/** Shown when a speaker profile was saved without a name. */
export const SPEAKER_NAME_MESSAGE =
  'This speaker has no name. Write the full name as it should appear on the ' +
  'speakers page, for example "Aline Uwase".';

/** Shown when a partner was saved without an organisation name. */
export const PARTNER_NAME_MESSAGE =
  'This partner has no name. Write the name of the organisation as it should ' +
  'appear next to its logo.';

/** Shown when a row in a speaker's "Links" list has no name on it. */
export const LINK_NAME_MESSAGE =
  'One of the links has nothing written in "Name". Type what the link is, for ' +
  'example "Instagram" or "Her website", or delete the row.';

/** Shown when an event was saved without a short summary. */
export const EVENT_SUMMARY_MESSAGE =
  'This event has no short summary. Write one or two sentences: they appear in ' +
  'the events list and whenever somebody shares the page.';

/**
 * Shown when a text is over the limit. Every long text field in the CMS shares
 * the same limit, so one sentence covers all of them; which field it is comes
 * from the line Astro prints in front of the message, or from the label the
 * "Site texts" form puts there.
 */
export const TEXT_TOO_LONG_MESSAGE =
  `This text is longer than the ${MAX_TEXT_LENGTH} characters this field allows. ` +
  'Shorten it and save again.';

/** Shown when a required text was left empty in the "Site texts" form. */
export const SITE_TEXT_EMPTY_MESSAGE =
  'This text is empty, and it appears on the website exactly as it is written ' +
  'here. Type the words that should show, then save again.';

/** Shown when the contact address is not a complete email address. */
export const EMAIL_MESSAGE =
  'This is not a complete email address. Write the address visitors should ' +
  'write to, in full, for example hello@tedxkigali.rw';

/**
 * Shown when a date cannot be read. Typing is the usual cause: every date in
 * the CMS has a calendar next to it, and what is typed around the calendar
 * tends not to survive being saved.
 */
export const DATE_MESSAGE =
  'This date cannot be read. Pick the day from the calendar in the CMS instead ' +
  'of typing it, then save again.';

/** Shown when an event's end time is not after its start time. */
export const EVENT_END_BEFORE_START_MESSAGE =
  'This event ends before it starts. Check the end date and time — a mistyped ' +
  'year is the usual cause — or empty it, and the website will assume four hours.';

/**
 * Shown when a saved start or end time is not on Kigali time. The clock in the
 * CMS takes its time zone from the computer the editor is sitting at, so a
 * volunteer working from abroad types the right numbers against the wrong zone,
 * and the website then shows the event at an hour nobody chose.
 */
export const EVENT_TIME_ZONE_MESSAGE =
  'This date and time was not saved on Kigali time, so the website would show ' +
  'the event at the wrong hour. Set the clock on your computer to Kigali time, ' +
  'or ask somebody in Rwanda to do it, then open the event again, pick the date ' +
  'and time once more, and save.';

/** Shown when the ticket status is not one of the five choices in the list. */
export const TICKET_STATUS_MESSAGE =
  'The ticket status has to be one of the choices in the list: "Tickets coming ' +
  'soon", "Tickets on sale", "Free entry — registration required", "Sold out" ' +
  'or "Registrations closed". Open the event in the CMS and pick one of them.';

/** Shown when the partner level is not one of the four choices in the list. */
export const PARTNER_LEVEL_MESSAGE =
  'The partner level has to be one of the choices in the list: "Headline ' +
  'partner", "Gold partner", "Partner" or "Community partner". Open the partner ' +
  'in the CMS and pick one of them.';

/** Shown when the booking button holds something that is not writing. */
export const BOOKING_LABEL_MESSAGE =
  'The booking button text has to be words, because they are printed on the ' +
  'button, for example "Book your seat". Empty the field to use those words.';

/** Shown when a yes/no switch holds something other than yes or no. */
export const YES_NO_MESSAGE =
  'This is a switch that is either on or off. Open the entry in the CMS and use ' +
  'the switch, rather than typing a word into it.';

/** Shown when "Display order" holds something that is not a number. */
export const DISPLAY_ORDER_MESSAGE =
  'The display order has to be a number, for example 10 — the lowest number ' +
  'comes first. Leave it empty to put this entry after all the numbered ones.';

/** Shown when an uploaded file is not one of the picture types the site builds. */
export const IMAGE_FILE_TYPE_MESSAGE =
  'The website can only use pictures saved as JPG, PNG, WEBP, AVIF or SVG. ' +
  'Save the picture as a JPG and upload it again.';

/** Shown when an event image was uploaded with no description for screen readers. */
export const EVENT_IMAGE_ALT_MESSAGE =
  'The event image needs a description. Write in "Image description" what the ' +
  'picture shows — it is read aloud to visitors who cannot see it.';

/** Shown when a talk cover was uploaded with no description for screen readers. */
export const TALK_COVER_ALT_MESSAGE =
  'The cover image needs a description. Write in "Cover image description" what ' +
  'the picture shows — it is read aloud to visitors who cannot see it.';

/** Shown when a speaker photo was uploaded with no description for screen readers. */
export const SPEAKER_PHOTO_ALT_MESSAGE =
  'The photo needs a description. Write in "Photo description" what the picture ' +
  'shows — it is read aloud to visitors who cannot see it.';

/** Shown when a partner logo has no description for screen readers. */
export const PARTNER_LOGO_ALT_MESSAGE =
  'The logo needs a description. Write in "Logo description" whose logo it is, ' +
  'for example "Acme Ltd logo" — it is read aloud to visitors who cannot see it.';
