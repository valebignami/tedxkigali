// The TEDx programmes an edition can belong to.
//
// Same shape as SPONSOR_TIERS in src/lib/sponsors.ts: the Zod enum, the pages
// and the CMS select all read this list, so renaming one cannot leave the
// others behind. The select in .pages.yml is the one copy YAML cannot avoid —
// src/lib/pages-config.test.ts compares it to this file on every push.
//
// The names are TED's, not ours. TED's guidance for youth events is explicit —
// "The word 'Youth' is included at the end of their names (e.g. TEDx[Your City]
// Youth) … Include a space between the last word of the location name and the
// word 'Youth'" — and the other programmes are named after the community they
// serve in the same way. The older TEDxYouth@City form is not what TED asks for
// today. Do not edit these names to fit a layout; a licensed event's name is
// part of the licence.
//
// "TEDxKigali Kids" is the one name here TED's own list of event types does not
// contain: their programme for young people is Youth. It is offered because the
// organisers asked for it, and whoever holds the licence should confirm it is a
// type they may run before an event is published under it.
export const PROGRAMMES = ['flagship', 'women', 'youth', 'kids', 'countdown'] as const;

export type Programme = (typeof PROGRAMMES)[number];

/**
 * What an edition belongs to when nobody said otherwise. Every event written
 * before this field existed is a main-edition event, and so is the common case
 * afterwards, so the field is never one an editor has to think about.
 */
export const DEFAULT_PROGRAMME: Programme = 'flagship';

export const PROGRAMME_NAMES: Record<Programme, string> = {
  flagship: 'TEDxKigali',
  women: 'TEDxKigali Women',
  youth: 'TEDxKigali Youth',
  kids: 'TEDxKigali Kids',
  countdown: 'TEDxKigali Countdown',
};

/**
 * One line each, for the "Our programmes" block on the About page — the only
 * place on the site that says what these names mean. A visitor who has never
 * heard of TEDWomen reads a name and learns nothing; this is the difference.
 *
 * They describe the kind of event and nothing else. Nothing here may promise a
 * date, a venue, a price or an accommodation: a programme is listed as soon as
 * it has one published event, and a sentence about what the next one will offer
 * would be a promise nobody checked.
 */
export const PROGRAMME_BLURBS: Record<Programme, string> = {
  flagship: 'Our main edition: a day of talks in Kigali, open to anyone who books a seat.',
  women: "Talks built around the ideas and the work of women, part of TED's TEDWomen programme.",
  youth: 'Planned and hosted with young people, in the schools and communities they come from.',
  kids: 'Talks and activities made for younger children, and for the adults who bring them.',
  countdown: "Part of Countdown, TED's global initiative on the climate crisis.",
};

/** Shown when an event's programme is not one of the choices in the list. */
export const PROGRAMME_MESSAGE =
  'The programme has to be one of the choices in the list: "TEDxKigali", ' +
  '"TEDxKigali Women", "TEDxKigali Youth", "TEDxKigali Kids" or "TEDxKigali ' +
  'Countdown". Open the event in the CMS and pick one of them.';

/**
 * The programmes in `present`, deduplicated, in the order this file declares
 * them — which is the order the pages print them in, so the main edition leads
 * and the reading order of the About page and the events archive agree.
 */
export function programmesInOrder(present: Iterable<Programme>): Programme[] {
  const wanted = new Set(present);
  return PROGRAMMES.filter((programme) => wanted.has(programme));
}
