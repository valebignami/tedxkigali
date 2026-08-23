// Resolving a talk's edition is the one content reference the site follows, and
// the one place a green build could still ship a broken page: a deleted or
// hidden event leaves the talk pointing at nothing, which used to render a
// filter button labelled with the raw slug and a link to a page that was never
// built. Resolution and validation live in the same function on purpose — a
// caller cannot take the titles and forget the check.

export interface TalkEditionRef {
  /** The talk's id, which is its file name — what the editor sees in the CMS. */
  id: string;
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
 * The build-failure email a volunteer receives. It names the talk, names the
 * edition, and says which form to open — never "reference not found".
 */
export function missingEditionMessage(talkId: string, editionId: string): string {
  return (
    `Talk "${talkId}" points at the event "${editionId}", which does not exist or is hidden. ` +
    'Open the talk in the CMS and pick an edition from the list.'
  );
}

/**
 * Maps published talks onto the published editions they belong to, throwing an
 * editor-friendly error when a talk points at an event that was deleted or
 * hidden. Pass only the editions that are actually built: an event hidden with
 * "Hide from the website" has no page, so it must count as missing here.
 */
export function resolveEditions(
  talks: ReadonlyArray<TalkEditionRef>,
  editions: ReadonlyArray<EditionSummary>,
): ResolvedEditions {
  const byId = new Map(editions.map((edition) => [edition.id, edition]));
  const used = new Map<string, EditionSummary>();

  for (const talk of talks) {
    if (!talk.editionId) continue;
    const edition = byId.get(talk.editionId);
    if (!edition) throw new Error(missingEditionMessage(talk.id, talk.editionId));
    used.set(edition.id, edition);
  }

  return {
    titleById: new Map([...byId].map(([id, edition]) => [id, edition.title])),
    // Newest edition first, by date rather than by title: the titles only sort
    // chronologically as long as every one of them starts with the year.
    used: [...used.values()].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
  };
}
