// A speaker card can name the talk that speaker gave. Two things can go wrong
// with that link and they need opposite answers, which is why they are told
// apart here rather than both falling back to the talks archive:
//
//   - the talk is hidden. "Hide from the website" is documented as safe to use,
//     and the card degrades on purpose — the button goes to the archive.
//   - the talk was deleted. Nobody chose that consequence for this speaker, and
//     the only sign of it used to be one line in a build log that still exited
//     0, so the site published a speaker whose talk link went nowhere in
//     particular and nobody was told.

import { editorError } from '~/lib/editor-error';
import { referencedId } from '~/lib/stored-reference';

/** The build-failure message for a speaker whose talk is no longer there. */
export function missingTalkMessage(speakerName: string, talkId: string): string {
  return (
    `${speakerName} is linked to a talk saved as "${talkId}", and there is no such talk ` +
    'any more. If you deleted it on purpose, open this speaker in the CMS, empty ' +
    '"Their talk", and save. If you did not mean to delete it, add the talk back first.'
  );
}

/** Where the "Watch the talk" button on a speaker card points. */
export const TALKS_ARCHIVE_HREF = '/talks';

export interface SpeakerTalkLink {
  /** The talk's own card when there is one, the archive when there is not. */
  href: string;
}

/**
 * The link for one speaker card.
 *
 * The talk is looked up here rather than by the page, because what is stored in
 * "Their talk" is not an id: it is a reference field with `value: '{name}'` in
 * .pages.yml, so the CMS writes the talk's file name — see
 * src/lib/stored-reference.ts. Doing the lookup where the normalising happens
 * is what keeps the two from drifting apart again.
 *
 * `talksById` must hold the hidden talks as well, because a hidden talk and a
 * deleted one need opposite answers.
 */
export function speakerTalkLink(
  speakerName: string,
  storedId: string | undefined,
  talksById: ReadonlyMap<string, { id: string; draft: boolean }>,
): SpeakerTalkLink {
  const wanted = referencedId(storedId);
  if (!wanted) return { href: TALKS_ARCHIVE_HREF };
  const talk = talksById.get(wanted);
  // The message quotes the value the speaker file actually holds, not the id
  // derived from it: that is the string the volunteer, or the maintainer they
  // forward the message to, can search for.
  if (!talk) throw editorError(missingTalkMessage(speakerName, storedId ?? wanted));
  // The talk card on /talks is the only thing on the site that addresses a
  // single talk, so that is where "Watch the talk" goes. A hidden talk has no
  // card, so there is nothing to point at but the archive.
  return { href: talk.draft ? TALKS_ARCHIVE_HREF : `${TALKS_ARCHIVE_HREF}#${talk.id}` };
}
