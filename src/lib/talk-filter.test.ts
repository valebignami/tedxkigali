import { describe, expect, it } from 'vitest';
import { hasTag, matchesScope, type Scope } from '~/lib/talk-filter';

const ALL: Scope = { kind: 'all', value: 'all' };
const WOMEN: Scope = { kind: 'programme', value: 'women' };
const W25: Scope = { kind: 'edition', value: 'tedxkigali-women-2025' };

const card = { programme: 'women', edition: 'tedxkigali-women-2025', tags: 'business|community' };
const orphan = { programme: '', edition: '', tags: '' };

describe('matchesScope', () => {
  it('takes every card when nothing is chosen', () => {
    expect(matchesScope(card, ALL)).toBe(true);
    expect(matchesScope(orphan, ALL)).toBe(true);
  });

  it('takes a card of the chosen programme and no other', () => {
    expect(matchesScope(card, WOMEN)).toBe(true);
    expect(matchesScope({ ...card, programme: 'youth' }, WOMEN)).toBe(false);
  });

  it('takes a card of the chosen edition and no other', () => {
    expect(matchesScope(card, W25)).toBe(true);
    expect(matchesScope({ ...card, edition: 'tedxkigali-women-2024' }, W25)).toBe(false);
  });

  // A talk filed under no edition is a real state: the field is optional, and
  // the card then carries empty attributes rather than none. It must fall out
  // of every programme and every edition, not into all of them.
  it('leaves a talk with no edition out of every programme and edition', () => {
    expect(matchesScope(orphan, WOMEN)).toBe(false);
    expect(matchesScope(orphan, W25)).toBe(false);
    expect(matchesScope({}, WOMEN)).toBe(false);
    expect(matchesScope({}, W25)).toBe(false);
  });

  // A programme id could one day be equal to an edition id. The kind decides
  // which attribute is read, so the two can never be confused for each other.
  it('reads the attribute its kind names, not whichever one matches', () => {
    const odd = { programme: 'women', edition: 'women' };
    expect(matchesScope(odd, { kind: 'programme', value: 'women' })).toBe(true);
    expect(matchesScope({ programme: 'women', edition: 'x' }, { kind: 'edition', value: 'women' })).toBe(false);
  });
});

describe('hasTag', () => {
  it('takes every card when no topic is chosen', () => {
    expect(hasTag('business|community', null)).toBe(true);
    expect(hasTag(undefined, null)).toBe(true);
    expect(hasTag('', null)).toBe(true);
  });

  it('takes a card carrying the topic, in any position', () => {
    expect(hasTag('business|community', 'business')).toBe(true);
    expect(hasTag('business|community', 'community')).toBe(true);
  });

  it('refuses a card that does not carry it', () => {
    expect(hasTag('business|community', 'climate')).toBe(false);
    expect(hasTag('', 'climate')).toBe(false);
    expect(hasTag(undefined, 'climate')).toBe(false);
  });

  // Splitting on the separator rather than searching the string: "public" must
  // not match a card tagged "public speaking", and a tag must not match half of
  // a longer one.
  it('matches whole tags, never a piece of one', () => {
    expect(hasTag('public speaking', 'public')).toBe(false);
    expect(hasTag('storytelling', 'story')).toBe(false);
    expect(hasTag('public speaking|climate', 'public speaking')).toBe(true);
  });
});

// The point of the change: the two answers are combined with "and". A count
// that grows when a second filter is added is the page discarding the first,
// which is exactly what it used to do.
describe('the two filters together', () => {
  const talks = [
    { programme: 'women', edition: 'w25', tags: 'business' },
    { programme: 'women', edition: 'w25', tags: 'community' },
    { programme: 'women', edition: 'w24', tags: 'business' },
    { programme: 'youth', edition: 'y24', tags: 'business' },
  ];
  const count = (scope: Scope, topic: string | null) =>
    talks.filter((t) => matchesScope(t, scope) && hasTag(t.tags, topic)).length;

  it('never widens the result when a topic is added', () => {
    for (const scope of [ALL, { kind: 'programme', value: 'women' } as Scope, { kind: 'edition', value: 'w25' } as Scope]) {
      for (const topic of ['business', 'community']) {
        expect(count(scope, topic)).toBeLessThanOrEqual(count(scope, null));
      }
    }
  });

  it('narrows step by step down the sequence a visitor walks', () => {
    expect(count(ALL, null)).toBe(4);
    expect(count({ kind: 'programme', value: 'women' }, null)).toBe(3);
    expect(count({ kind: 'edition', value: 'w25' }, null)).toBe(2);
    expect(count({ kind: 'edition', value: 'w25' }, 'business')).toBe(1);
  });

  it('can produce nothing at all, which the page has to say out loud', () => {
    expect(count({ kind: 'programme', value: 'youth' }, 'community')).toBe(0);
  });
});
