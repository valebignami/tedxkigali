// The fixtures below are real output. Each was captured by breaking content on
// purpose and running the command the workflow runs, then shortened and given
// the paths a runner would print instead of the ones a laptop does. They keep
// their escape sequences: the runner sets CI, and that alone is enough to make
// picocolors colour everything, with no terminal attached to anything.

import { describe, expect, it } from 'vitest';
import {
  addressee,
  editorFailure,
  failingLog,
  issueBody,
  recoveryComment,
  repeatComment,
  stripAnsi,
} from './publish-notice.mjs';

/** The escape character every one of these logs is full of. */
const E = '\u001B';

/** `npm run check` with one event holding three mistakes at once. */
const SCHEMA_LOG = `
> tedxkigali-site@0.0.1 check
> astro check

${E}[2m20:36:07${E}[22m ${E}[34m[content]${E}[39m Syncing content
${E}[31m[InvalidContentEntryDataError]${E}[39m ${E}[1mevents → rising-2027${E}[22m data does not match collection schema.

  ${E}[1mvenue${E}[22m: This event has no venue. Write the name of the place it happens, for example "Kigali Convention Centre" — the website builds the map link from it.
  ${E}[1mschedule.0.time${E}[22m: One of the programme rows has a time the website cannot read. Use 24-hour time like "09:00", or a range like "09:00 - 09:20".
  ${E}[1mendDate${E}[22m: This event ends at the same moment it starts, or earlier. Check the end date and time — the same time left in both fields, or a mistyped year, is the usual cause — or empty it, and the website will assume four hours.

  ${E}[1mHint:${E}[22m
${E}[33m    See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.${E}[39m
  ${E}[1mError reference:${E}[22m
    https://docs.astro.build/en/reference/errors/invalid-content-entry-data-error/
  ${E}[1mLocation:${E}[22m
    /home/runner/work/tedxkigali/src/content/events/rising-2027.md:0:0
  ${E}[1mStack trace:${E}[22m
    at getEntryData (file:///home/runner/work/tedxkigali/node_modules/astro/dist/content/utils.js:155:26)
`;

/** `npm run check` with an event whose end date carries no time of day. */
const SENTENCE_LOG = `
> tedxkigali-site@0.0.1 check
> astro check

${E}[2m20:29:43${E}[22m ${E}[34m[content]${E}[39m Syncing content
${E}[33m${E}[1m20:29:43 [WARN] [glob-loader]${E}[39m No files found matching "**/*.md" in directory "src/content/sponsors"
The event "Rising 2027" has a problem in "End date and time". It holds a day but no time of day, so the website cannot say what time the event starts. Open the event in the CMS, pick the day and the time together from the calendar, and save.
`;

/** `npm run build` with two required "Site texts" fields wrong at once. */
const SETTINGS_LOG = `
> tedxkigali-site@0.0.1 build
> astro build

${E}[2m20:36:28${E}[22m ${E}[34m[build]${E}[39m Building static entrypoints...
${E}[2m20:36:29${E}[22m ${E}[34m[vite]${E}[39m ${E}[32m✓ built in 1.27s${E}[39m

${E}[42m${E}[30m generating static routes ${E}[39m${E}[49m
Your change to "Site texts" was saved, but the website could not be built from it.

  Home page headline — This text is empty, and it appears on the website exactly as it is written here. Type the words that should show, then save again.
  Contact email — This is not a complete email address. Write the address visitors should write to, in full, for example hello@tedxkigali.rw

Open "Site texts" in the CMS, correct every line above, and save again. Nothing you typed is lost: it is in the file exactly as you left it.
`;

/**
 * `npm test` with the same "Site texts" mistake. src/lib/settings.ts parses the
 * file as it is imported, so four test files fail to load with one message.
 */
const SUITE_LOG = `
> tedxkigali-site@0.0.1 test
> vitest run --passWithNoTests

 RUN  v4.1.11 /home/runner/work/tedxkigali

 ❯ src/lib/settings.test.ts (0 test)
 ❯ src/lib/seo.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/seo.test.ts [ src/lib/seo.test.ts ]
Error: Your change to "Site texts" was saved, but the website could not be built from it.

  Home page headline — This text is empty, and it appears on the website exactly as it is written here. Type the words that should show, then save again.

Open "Site texts" in the CMS, correct every line above, and save again. Nothing you typed is lost: it is in the file exactly as you left it.
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/lib/settings.test.ts [ src/lib/settings.test.ts ]
Error: Your change to "Site texts" was saved, but the website could not be built from it.

  Home page headline — This text is empty, and it appears on the website exactly as it is written here. Type the words that should show, then save again.

Open "Site texts" in the CMS, correct every line above, and save again. Nothing you typed is lost: it is in the file exactly as you left it.
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

 Test Files  2 failed (21)
`;

/** `npm test` with a test that genuinely fails, and one that throws. */
const ASSERTION_LOG = `
 FAIL  src/lib/dates.test.ts > dates > formats a day
AssertionError: expected 2 to be 3 // Object.is equality

- Expected
+ Received

 ❯ src/lib/dates.test.ts:5:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/lib/dates.test.ts > dates > loads
Error: Something technical went wrong while the module was being loaded here.
 ❯ src/lib/dates.test.ts:8:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯
`;

/** A build that published. Its own chatter must not read as a message. */
const GREEN_LOG = `
> tedxkigali-site@0.0.1 build
> astro build

${E}[2m20:35:29${E}[22m ${E}[34m[build]${E}[39m Building static entrypoints...
${E}[2m20:35:29${E}[22m   ${E}[34m├─${E}[39m ${E}[2m/partners/index.html${E}[22mThe collection "sponsors" does not exist or is empty. Please check your content config file for errors.
 ${E}[2m(+13ms)${E}[22m
${E}[2m20:35:29${E}[22m ${E}[34m[build]${E}[39m 11 page(s) built in ${E}[1m6.55s${E}[22m
${E}[2m20:35:29${E}[22m ${E}[34m[build]${E}[39m ${E}[1mComplete!${E}[22m
`;

describe('stripAnsi', () => {
  it('leaves the writing and takes the colour', () => {
    expect(stripAnsi(`${E}[31mred${E}[39m ok`)).toBe('red ok');
  });

  it('takes a hyperlink sequence with it', () => {
    expect(stripAnsi(`see ${E}]8;;https://example.com${E}\\here`)).toBe('see here');
  });
});

describe('editorFailure, on a schema block', () => {
  const failure = editorFailure(SCHEMA_LOG);

  it('names the entry and the section the CMS calls it', () => {
    expect(failure.entryId).toBe('rising-2027');
    expect(failure.section).toBe('Events');
  });

  it('keeps every message of the save, in the order Astro reported them', () => {
    expect(failure.messages).toHaveLength(3);
    expect(failure.messages[0]).toMatch(/^This event has no venue\./);
    expect(failure.messages[2]).toMatch(/^This event ends at the same moment it starts/);
  });

  it('drops the field name in front of each one, which no editor has seen', () => {
    expect(failure.messages.join('\n')).not.toMatch(/endDate|schedule\.0/);
  });

  it("drops Astro's hint, reference, location and stack", () => {
    expect(failure.messages.join('\n')).not.toMatch(/docs\.astro\.build|node_modules|\.md:0:0/);
  });
});

describe('editorFailure, on a sentence thrown by hand', () => {
  it('reads the whole sentence and nothing above it', () => {
    const failure = editorFailure(SENTENCE_LOG);
    expect(failure.messages).toHaveLength(1);
    expect(failure.messages[0]).toBe(
      'The event "Rising 2027" has a problem in "End date and time". It holds a day but no time ' +
        'of day, so the website cannot say what time the event starts. Open the event in the CMS, ' +
        'pick the day and the time together from the calendar, and save.',
    );
    expect(failure.entryId).toBeUndefined();
  });

  it('keeps a message that runs over several lines whole', () => {
    const failure = editorFailure(SETTINGS_LOG);
    expect(failure.messages[0]).toMatch(/^Your change to "Site texts" was saved/);
    expect(failure.messages[0]).toContain('Home page headline —');
    expect(failure.messages[0]).toContain('Contact email —');
    expect(failure.messages[0]).toMatch(/exactly as you left it\.$/);
  });
});

describe('editorFailure, on a test run', () => {
  it('reads the message out of a suite that would not load', () => {
    const failure = editorFailure(SUITE_LOG);
    expect(failure.messages).toHaveLength(1);
    expect(failure.messages[0]).toMatch(/^Your change to "Site texts" was saved/);
    expect(failure.messages[0]).toMatch(/exactly as you left it\.$/);
  });

  it('says nothing about a test that simply failed', () => {
    expect(editorFailure(ASSERTION_LOG)).toBeNull();
  });
});

describe('editorFailure, when there is nothing for an editor', () => {
  it('says nothing about a build that worked', () => {
    expect(editorFailure(GREEN_LOG)).toBeNull();
  });

  it('says nothing about an empty log', () => {
    expect(editorFailure('')).toBeNull();
  });

  it('says nothing about a failure with a stack under it', () => {
    const log = 'Cannot find module ./missing.js, which was imported from somewhere else.\n    at ESMLoader.resolve (node:internal/modules/esm/loader:8:1)\n';
    expect(editorFailure(log)).toBeNull();
  });
});

describe('failingLog', () => {
  const read = (path) => `log of ${path}`;

  it('reads the last step that ran, which is the one that stopped', () => {
    const exists = (path) => path.endsWith('gate-test.log') || path.endsWith('gate-check.log');
    expect(failingLog('/tmp', exists, read)).toMatch(/gate-check\.log$/);
  });

  it('reads the test log when the tests are as far as the run got', () => {
    const exists = (path) => path.endsWith('gate-test.log');
    expect(failingLog('/tmp', exists, read)).toMatch(/gate-test\.log$/);
  });

  it('is empty when no step got far enough to write one', () => {
    expect(failingLog('/tmp', () => false, read)).toBe('');
  });
});

describe('addressee', () => {
  it('mentions the account the save was committed as', () => {
    expect(addressee('kigali-volunteer', 'someone-else')).toBe('@kigali-volunteer');
  });

  it('falls back to whoever started the run when there is no commit', () => {
    expect(addressee(undefined, 'valebignami')).toBe('@valebignami');
  });

  it('does not mention a bot, which has nobody behind it to notify', () => {
    expect(addressee('github-actions[bot]')).toBe('`github-actions[bot]`');
  });

  it('still addresses somebody when GitHub named nobody', () => {
    expect(addressee(undefined, undefined)).toBe('Whoever saved this');
  });
});

const RUN_URL = 'https://github.com/valebignami/tedxkigali/actions/runs/1';

describe('issueBody, with a message for the editor', () => {
  const body = issueBody({
    mention: '@kigali-volunteer',
    failure: editorFailure(SCHEMA_LOG),
    runUrl: RUN_URL,
    commitUrl: 'https://github.com/valebignami/tedxkigali/commit/abc1234',
    sha: 'abc1234def',
    subject: 'Update src/content/events/rising-2027.md (via Pages CMS)',
  });

  it('opens by addressing the person who saved', () => {
    expect(body.startsWith('@kigali-volunteer — the change just saved has not gone live.')).toBe(true);
  });

  it('puts the messages at the top, quoted, before anything else', () => {
    expect(body.indexOf('This event has no venue')).toBeLessThan(body.indexOf('Nothing is broken'));
    expect(body).toContain('> - This event has no venue.');
  });

  it('names the entry and the section it is in', () => {
    expect(body).toContain('the entry saved as `rising-2027`, under **Events**');
  });

  it('says the website is unchanged and nothing is lost', () => {
    expect(body).toContain('still showing exactly what it showed before this save');
    expect(body).toContain('they are saved, exactly as they were left');
  });

  it('says it will publish itself once the entry is fixed, and close itself', () => {
    expect(body).toContain('publishes on its own');
    expect(body).toContain('closes itself');
  });

  it('sends the maintainer to the run, and nobody to a stack trace', () => {
    expect(body).toContain(`[the full record of the attempt](${RUN_URL})`);
    expect(body).not.toContain('node_modules');
  });

  it('keeps the commit subject inside a code span so it cannot reformat the page', () => {
    expect(body).toContain('`Update src/content/events/rising-2027.md (via Pages CMS)`');
  });
});

describe('issueBody, with nothing for the editor', () => {
  const body = issueBody({ mention: '@valebignami', failure: null, runUrl: RUN_URL, sha: 'abc1234def' });

  it('says plainly that this one is not the editor to fix', () => {
    expect(body).toContain('**This is not something you did wrong**');
    expect(body).toContain('for whoever maintains the site');
  });

  it('still says the website is unchanged', () => {
    expect(body).toContain('still showing exactly what it showed before this save');
  });

  it('offers no entry to go and open, because none was named', () => {
    expect(body).not.toContain('under **Events**');
  });
});

describe('repeatComment', () => {
  it('carries the new message, so one page can hold every attempt', () => {
    const comment = repeatComment({
      mention: '@kigali-volunteer',
      failure: editorFailure(SENTENCE_LOG),
      runUrl: RUN_URL,
    });
    expect(comment.startsWith('@kigali-volunteer — this has happened again')).toBe(true);
    expect(comment).toContain('> The event "Rising 2027" has a problem');
    expect(comment).toContain(RUN_URL);
  });
});

describe('recoveryComment', () => {
  it('tells the person it worked, which is the other half of being told', () => {
    const comment = recoveryComment({ mention: '@kigali-volunteer', runUrl: RUN_URL });
    expect(comment).toContain('this is fixed');
    expect(comment).toContain('rebuilt and published');
    expect(comment).toContain(RUN_URL);
  });
});
