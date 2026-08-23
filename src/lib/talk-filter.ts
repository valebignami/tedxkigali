// The two questions the talks page asks of every card, kept out of the browser
// script so they can be tested without one.
//
// They are separate on purpose. The page has two rows of pills and they narrow
// rather than replace each other: the top row picks a scope, the topic row cuts
// into whatever that scope holds. Written as one combined predicate, the rule
// that a card must pass *both* would live in the "and" between two calls in a
// script no test loads.

export interface Scope {
  kind: 'all' | 'programme' | 'edition';
  /** The programme id, the edition id, or 'all'. */
  value: string;
}

/**
 * Whether a card is inside the chosen scope.
 *
 * A talk with no edition carries an empty programme and an empty edition — the
 * attributes are always written, so that a talk filed under nothing simply
 * matches no programme and no edition rather than matching every one of them.
 * An 'all' scope takes everything, that talk included.
 */
export function matchesScope(
  card: { programme?: string; edition?: string },
  scope: Scope,
): boolean {
  if (scope.kind === 'all' || scope.value === 'all') return true;
  if (scope.kind === 'programme') return (card.programme ?? '') === scope.value;
  return (card.edition ?? '') === scope.value;
}

/**
 * Whether a card carries the chosen topic. No topic chosen takes everything.
 *
 * The separator is the one TalkCard joins the tags with, and the schema refuses
 * a tag containing it — see src/content.config.ts. Splitting an empty attribute
 * yields one empty string, which no tag can be, so a talk with no tags is
 * correctly excluded from every topic.
 */
export function hasTag(tags: string | undefined, topic: string | null): boolean {
  if (!topic) return true;
  return (tags ?? '').split('|').includes(topic);
}
