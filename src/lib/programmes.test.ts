import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRAMME,
  PROGRAMMES,
  PROGRAMME_BLURBS,
  PROGRAMME_NAMES,
  editionLabelUnder,
  programmesInOrder,
  type Programme,
} from '~/lib/programmes';

describe('the programme names', () => {
  // The name of a licensed TEDx event is part of its licence, and these are the
  // shapes TED asks for: the mark is one word, and a sub-programme adds its own
  // word after a single space. The older TEDxYouth@City form is not one of them.
  it("are the mark, or the mark and one word after a single space", () => {
    for (const programme of PROGRAMMES) {
      expect(PROGRAMME_NAMES[programme]).toMatch(/^TEDxKigali( [A-Z][a-z]+)?$/);
    }
  });

  it('give the main edition the bare mark and every other programme a word of its own', () => {
    expect(PROGRAMME_NAMES[DEFAULT_PROGRAMME]).toBe('TEDxKigali');
    const others = PROGRAMMES.filter((programme) => programme !== DEFAULT_PROGRAMME);
    for (const programme of others) {
      expect(PROGRAMME_NAMES[programme]).not.toBe('TEDxKigali');
    }
  });

  it('never split the mark or fall back to the old chicane form', () => {
    for (const name of Object.values(PROGRAMME_NAMES)) {
      expect(name).not.toMatch(/TEDx Kigali/);
      expect(name).not.toContain('@');
    }
  });

  // The guide is where a volunteer meets these names, and the caution about
  // the one TED does not list lives there too. A programme added here and not
  // written up there is a choice in the form that nothing explains.
  it('are every one of them named in the editing guide', () => {
    const guide = readFileSync('docs/EDITING.md', 'utf8');
    for (const name of Object.values(PROGRAMME_NAMES)) {
      expect(guide).toContain(name);
    }
  });

  it('are all different from one another', () => {
    expect(new Set(Object.values(PROGRAMME_NAMES)).size).toBe(PROGRAMMES.length);
  });
});

describe('the programme descriptions', () => {
  it('are a sentence each', () => {
    for (const programme of PROGRAMMES) {
      const blurb = PROGRAMME_BLURBS[programme];
      expect(blurb.length).toBeGreaterThan(20);
      expect(blurb.endsWith('.')).toBe(true);
    }
  });

  // A programme is listed on the About page as soon as it has one published
  // event, and the sentence beside it is never edited per edition. Anything in
  // it about a date, a price or what a guest will be given is therefore a
  // promise about an event nobody has planned yet — the exact mistake that put
  // wheelchair access and interpretation headsets on an invented event once.
  it('promise nothing about an event that has not happened', () => {
    for (const programme of PROGRAMMES) {
      expect(PROGRAMME_BLURBS[programme]).not.toMatch(
        /\b(free|ticket|tickets|wheelchair|accessible|refreshments|lunch|will be|every year|annual|20\d\d)\b/i,
      );
    }
  });
});

describe('the default programme', () => {
  it('is one of the programmes, and the one an unmarked event belongs to', () => {
    expect(PROGRAMMES).toContain(DEFAULT_PROGRAMME);
  });

  // Declaration order is print order on both pages that group by programme, and
  // the main edition leading is what makes the archive read the way the
  // organisation is shaped.
  it('is declared first', () => {
    expect(PROGRAMMES[0]).toBe(DEFAULT_PROGRAMME);
  });
});

describe('programmesInOrder', () => {
  it('returns the programmes present, in declaration order and not the order given', () => {
    expect(programmesInOrder(['countdown', 'women', 'flagship'])).toEqual([
      'flagship',
      'women',
      'countdown',
    ]);
  });

  it('lists a programme once however many editions it has', () => {
    expect(programmesInOrder(['women', 'women', 'women'])).toEqual(['women']);
  });

  it('leaves out the programmes nothing belongs to', () => {
    expect(programmesInOrder(['flagship'])).toEqual(['flagship']);
    expect(programmesInOrder([])).toEqual([]);
  });

  // The events page prints headings only when this returns more than one, so a
  // site with a single kind of event keeps the layout it had before programmes
  // existed. That is a behaviour, not an accident of the data.
  it('returns one entry for a site that only runs the main edition', () => {
    const everyEventIsFlagship: Programme[] = ['flagship', 'flagship', 'flagship'];
    expect(programmesInOrder(everyEventIsFlagship)).toHaveLength(1);
  });
});

describe('editionLabelUnder', () => {
  it('drops the programme name the row above already carries', () => {
    expect(editionLabelUnder('TEDxKigali Women 2025 — In the Room', 'women')).toBe(
      '2025 — In the Room',
    );
    expect(editionLabelUnder('TEDxKigali Youth 2024 — First Draft', 'youth')).toBe(
      '2024 — First Draft',
    );
  });

  // The main edition's name is the prefix of every other programme's, so a
  // flagship title must not be cut at "TEDxKigali " when it reads
  // "TEDxKigali Women …" — it never does, because a title only reaches this
  // function under its own programme.
  it('leaves the main edition its year and theme', () => {
    expect(editionLabelUnder('TEDxKigali 2026 — Rising', 'flagship')).toBe('2026 — Rising');
  });

  // An editor can title an edition anything. Cutting at a prefix that is not
  // there, or cutting a title down to nothing, both lose the editor's words.
  it('returns a title that does not start with the programme name unchanged', () => {
    expect(editionLabelUnder("Women's Day 2025", 'women')).toBe("Women's Day 2025");
    expect(editionLabelUnder('The Kigali Youth Forum', 'youth')).toBe('The Kigali Youth Forum');
  });

  it('returns a title that is only the programme name unchanged', () => {
    expect(editionLabelUnder('TEDxKigali Kids', 'kids')).toBe('TEDxKigali Kids');
    expect(editionLabelUnder('TEDxKigali Kids   ', 'kids')).toBe('TEDxKigali Kids   ');
  });

  // What is left has to stay inside the full title, or the visible words on the
  // button stop being part of its accessible name — WCAG 2.5.3.
  it('leaves what it returns inside the full title', () => {
    for (const title of [
      'TEDxKigali Women 2025 — In the Room',
      'TEDxKigali 2026 — Rising',
      "Women's Day 2025",
    ]) {
      for (const programme of PROGRAMMES) {
        expect(title).toContain(editionLabelUnder(title, programme));
      }
    }
  });
});
