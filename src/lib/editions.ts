// Resolving a talk's edition is the one content reference the site follows, and
// the one place a green build could still ship a broken page: a deleted or
// hidden event leaves the talk pointing at nothing, which used to render a
// filter button labelled with the raw slug and a link to a page that was never
// built. Resolution and validation live in the same function on purpose — a
// caller cannot take the titles and forget the check.

import { editorError } from '~/lib/editor-error';

export interface TalkEditionRef {
  /** The talk's title, which is how the CMS lists it and how a volunteer finds it. */
  title: string;
  editionId?: string;
}

export interface EditionSummary {
  id: string;
  title: string;
  startDate: Date;
}

export interface ResolvedEditions {
  /** Edition id to event title, for the label on a talk card. */
  titleById: ReadonlyMap<string, string>;
  /** Only the editions at least one talk belongs to, newest first. */
  used: EditionSummary[];
}

/**
 * The build-failure email a volunteer receives.
 *
 * Three different situations reach this message and it has to be true of all of
 * them, because the volunteer cannot tell them apart from where they sit: the
 * event is hidden, the event was deleted or renamed, or the value the CMS
 * stores for an edition is not the value the website looks one up by — which
 * the volunteer cannot fix at all, and which is why the last sentence sends
 * them to somebody who can. It used to state that the event "does not exist or
 * is hidden", which in the third case is the opposite of the truth.
 *
 * The order of the remedies matters. A hidden event is the common case — the
 * guide recommends "Hide from the website" for postponing one — and for that
 * case the fix is to un-hide the event or hide the talk with it. Only when the
 * event was really deleted or renamed is re-pointing the talk right; offered
 * first, it would read as the instruction, and a volunteer following it would
 * silently attribute the talk to an edition it was never filmed at.
 */
export function missingEditionMessage(talkTitle: string, editionId: string): string {
  return (
    `The talk "${talkTitle}" is filed under an edition saved as "${editionId}", and no ` +
    'event on the website answers to that. If you hid that event, make it visible again, ' +
    'or hide this talk with it. If you deleted or renamed it, open the talk in the CMS, ' +
    'pick the edition again from the list, and save. If you pick it again and this keeps ' +
    'happening, send this whole message to the site maintainer: what the CMS saves and ' +
    'what the website looks for have drifted apart, and only they can put that right.'
  );
}

/**
 * The build-failure message for the one case of the three above that can be
 * told apart from the others: the event is still in the CMS and only hidden.
 *
 * It is worth telling apart because it is the common one — the guide
 * recommends "Hide from the website" for postponing an edition — and because
 * being able to name the event by the title the volunteer gave it, rather than
 * by the id stored in the file, is the difference between a sentence about
 * their work and a sentence about the repository.
 */
export function hiddenEditionMessage(talkTitle: string, editionTitle: string): string {
  return (
    `The talk "${talkTitle}" is filed under "${editionTitle}", and that event is hidden ` +
    'from the website, so there is no page for this talk to belong to. Open that event in ' +
    'the CMS and turn "Hide from the website" off, or hide this talk with it and save.'
  );
}

/**
 * Maps published talks onto the published editions they belong to, throwing an
 * editor-friendly error when a talk points at an event that was deleted or
 * hidden. Pass only the editions that are actually built as `editions`: an
 * event hidden with "Hide from the website" has no page, so it must count as
 * missing here.
 *
 * `titlesOfEveryEdition` is for the message alone and changes no resolution:
 * pass the title of every event including the hidden ones, and a talk filed
 * under one of those is told so by name instead of by stored id.
 */
export function resolveEditions(
  talks: ReadonlyArray<TalkEditionRef>,
  editions: ReadonlyArray<EditionSummary>,
  titlesOfEveryEdition?: ReadonlyMap<string, string>,
): ResolvedEditions {
  const byId = new Map(editions.map((edition) => [edition.id, edition]));
  const used = new Map<string, EditionSummary>();

  for (const talk of talks) {
    if (!talk.editionId) continue;
    const edition = byId.get(talk.editionId);
    if (!edition) {
      const hiddenTitle = titlesOfEveryEdition?.get(talk.editionId);
      throw editorError(
        hiddenTitle
          ? hiddenEditionMessage(talk.title, hiddenTitle)
          : missingEditionMessage(talk.title, talk.editionId),
      );
    }
    used.set(edition.id, edition);
  }

  return {
    titleById: new Map([...byId].map(([id, edition]) => [id, edition.title])),
    // Newest edition first, by date rather than by title: the titles only sort
    // chronologically as long as every one of them starts with the year.
    used: [...used.values()].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
  };
}
