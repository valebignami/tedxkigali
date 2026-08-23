// Half of the publishing gate lives in pages.yml: the tests, `astro check` and
// the build all run before anything reaches GitHub Pages, so a content mistake
// stops the deploy and the live site goes on serving the last version that
// worked. This file is the other half — telling the person who saved.
//
// It exists because nobody was told. An event was saved with its start and end
// at the same moment, the run went red, the site quietly did not update, and the
// person who saved it received nothing — they learnt of it only because somebody
// else went and read the Actions tab on their behalf. GitHub's own failure email
// is not an answer: it arrives only if the account's notification settings allow
// it, and no volunteer will go and configure them.
//
// An issue is used instead because it needs nothing this repository cannot
// grant itself — `issues: write` on GITHUB_TOKEN, no secret, no SMTP server, no
// third party — and because @-mentioning somebody in a new issue or a new
// comment emails them under GitHub's default notification settings, which is
// the one channel a volunteer already has switched on. It is also visible in
// the repository afterwards, so a missed email is not a lost message.
//
// Plain node, no dependency: `npm ci` has run by the time this is called, but
// nothing here needs it, and fetch is built in on Node 22.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The one open issue is found by this label, and by nothing else. */
export const ISSUE_LABEL = 'publish-failure';

/**
 * The title never changes, for two reasons: it is the subject line of the email
 * a volunteer receives, so it has to be true of every failure without being
 * read first, and a stable title is what makes the reuse of a single issue
 * legible to somebody scrolling the issue list.
 */
export const ISSUE_TITLE = 'The website was not updated — your last save did not go live';

export const CMS_URL = 'https://app.pagescms.org';

/**
 * The name each content collection has in the CMS, which is the only name the
 * person reading the issue has ever seen. `sponsors` is the odd one: the folder
 * is sponsors, the section in the CMS is called Partners.
 */
const SECTION_NAMES = {
  events: 'Events',
  talks: 'Talks',
  speakers: 'Speakers',
  sponsors: 'Partners',
};

// picocolors turns colour on whenever CI is set, whatever the terminal is, so
// every log this reads is full of escape sequences even though nothing on the
// runner is a terminal. SGR sequences are all Astro and vitest emit; the OSC
// arm is there so that a hyperlink sequence could not leave its url in the
// middle of a sentence.
const SGR = /\u001B\[[0-9;?]*[A-Za-z]/g;
const OSC = /\u001B\][^\u0007\u001B]*(?:\u0007|\u001B\\)/g;

export const stripAnsi = (text) => text.replace(OSC, '').replace(SGR, '');

// Astro's own lines all start with a timestamp or a [tag], npm's with "> " or
// "npm ", and anything indented belongs to a block that has already been
// introduced. A sentence written for an editor starts at column zero and starts
// with none of that.
const NOISE = /^(\s|\[|>|npm[ @]|\d{2}:\d{2}:\d{2})/;

// What tells an editor's message apart from a technical one, and the reason it
// can be told apart at all: editorError() in src/lib/editor-error.ts empties the
// stack, precisely so that Astro and vitest print the sentence with nothing
// under it. A block carrying a frame, a file:// url or a path into node_modules
// is therefore not a message written for a volunteer.
const TECHNICAL = /(^\s*(at |❯ )|node_modules|file:\/\/)/m;

/** Long enough to be prose. Every message written for an editor is a paragraph. */
const MIN_WORDS = 12;

const isEditorProse = (block) =>
  block.trim().length > 0 && !TECHNICAL.test(block) && block.trim().split(/\s+/).length >= MIN_WORDS;

// "[InvalidContentEntryDataError] events → tedxkigali-2026 data does not match
// collection schema." — the header Astro prints above the fields it refused.
const SCHEMA_HEADER = /^\[\w*Error\] (\S+) → (.+?) data does not match collection schema\.$/;

// Astro's own tail under that block: a documentation link, an error reference,
// the file and a stack. None of it is for the person reading the issue.
const SCHEMA_TAIL = /^\s*(Hint|Error reference|Location|Stack trace):\s*$/;

// "  endDate: This event ends at the same moment it starts…". The field path is
// dropped: it is the name the code uses, and the CMS has never shown it to
// anybody. Every message says on its own what it is about — see the note at the
// top of src/lib/content-messages.ts — so nothing is lost by dropping it.
const FIELD_PREFIX = /^([^\s:]+): (.+)$/;

/** The block Astro prints when a saved entry fails its collection's schema. */
function schemaFailure(lines) {
  const start = lines.findIndex((line) => SCHEMA_HEADER.test(line));
  if (start === -1) return null;
  const [, collection, entryId] = lines[start].match(SCHEMA_HEADER);
  const messages = [];
  for (const line of lines.slice(start + 1)) {
    if (SCHEMA_TAIL.test(line)) break;
    const text = line.trim();
    if (!text) continue;
    const field = text.match(FIELD_PREFIX);
    messages.push(field ? field[2] : text);
  }
  if (messages.length === 0) return null;
  return { section: SECTION_NAMES[collection] ?? collection, entryId, messages };
}

// vitest prints an error thrown while a test file is being imported as "Error: "
// at column zero. src/lib/settings.ts parses "Site texts" the moment it is
// imported, so a required field emptied in the CMS fails `npm test` before it
// ever reaches `astro check` — and four test files import it, which is why
// identical blocks are collapsed into one below.
const SUITE_ERROR = /^Error: (.*)$/;

// The rule vitest draws under each failure, and the heading it draws above
// the group. Either ends the block; the frames vitest prints under a message
// do not, because a block that has any is how a technical error is known.
const SUITE_TAIL = /^(⎯|─|-){4,}|^ (FAIL|RUN)/;

/** The editor sentences vitest reports from a test file that would not load. */
function suiteFailure(lines) {
  const found = [];
  for (let i = 0; i < lines.length; i += 1) {
    const head = lines[i].match(SUITE_ERROR);
    if (!head) continue;
    const block = [head[1]];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (SUITE_TAIL.test(lines[j])) break;
      block.push(lines[j]);
    }
    const text = block.join('\n').trim();
    if (isEditorProse(text) && !found.includes(text)) found.push(text);
  }
  return found.length > 0 ? { messages: found } : null;
}

/**
 * The sentence a check written by hand throws — an event in a folder, a day
 * with no time on it, a talk pointing at an edition that is gone, "Site texts"
 * saved empty. Astro prints it on its own and stops, so it runs from the first
 * line that is neither Astro's nor npm's chatter to the end of the log.
 */
function sentenceFailure(lines) {
  const start = lines.findIndex((line) => line.trim() !== '' && !NOISE.test(line));
  if (start === -1) return null;
  const block = lines
    .slice(start)
    .join('\n')
    .replace(/(\n(\s*|npm[ @].*))+$/, '')
    .trim();
  return isEditorProse(block) ? { messages: [block] } : null;
}

/**
 * The message written for the person who saved, dug out of the log of the step
 * that went red, or null when the failure was technical and there is nothing an
 * editor could act on.
 */
export function editorFailure(rawLog) {
  const lines = stripAnsi(rawLog).split(/\r?\n/);
  return schemaFailure(lines) ?? suiteFailure(lines) ?? sentenceFailure(lines);
}

/**
 * The steps of the gate, in the order they run. Each writes its own log through
 * `tee`, so the last one that exists is the step that stopped the run: a step
 * that never ran left no file, and a step that passed was followed by another.
 */
export const GATE_LOGS = ['gate-test.log', 'gate-check.log', 'gate-build.log'];

/** The log of the step that stopped the run, or '' when no step got that far. */
export function failingLog(directory, exists = existsSync, read = readFileSync) {
  for (const name of [...GATE_LOGS].reverse()) {
    const path = join(directory, name);
    if (exists(path)) return read(path, 'utf8');
  }
  return '';
}

/** A blockquote holding one message, or a quoted list holding several. */
function quoted(messages) {
  if (messages.length === 1) {
    return messages[0]
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n');
  }
  return messages.map((message) => `> - ${message}`).join('\n');
}

const NOTHING_IS_BROKEN =
  '**Nothing is broken.** The website is still showing exactly what it showed ' +
  'before this save, and visitors see a working site. Nothing was published, ' +
  'and nothing was damaged. The words that were typed are not lost either: ' +
  'they are saved, exactly as they were left.';

/**
 * The line naming the entry, when the failure named one. The CMS lists entries
 * by title and this is the name of the file they were first saved under, so it
 * is offered as a name to recognise rather than as somewhere to click.
 */
const entryLine = (failure) =>
  failure?.entryId
    ? `\nIt is the entry saved as \`${failure.entryId}\`, under **${failure.section}** in the CMS.\n`
    : '';

/**
 * The commit subject, kept as inline code: it is written by whoever pushed, and
 * inside a code span its own punctuation cannot reformat the page around it.
 * Backticks are dropped for the same reason — one would close the span.
 */
function commitNote({ sha, subject, commitUrl, runUrl }) {
  const short = sha ? sha.slice(0, 7) : 'the last push';
  const said = subject ? ` \`${subject.split('\n')[0].replace(/`/g, '').slice(0, 120)}\`` : '';
  const commit = commitUrl ? `[\`${short}\`](${commitUrl})` : `\`${short}\``;
  return `<sub>Save ${commit}${said} · [the full record of the attempt](${runUrl})</sub>`;
}

/** The whole issue, rewritten from scratch on every failure so the top is current. */
export function issueBody({ mention, failure, runUrl, commitUrl, sha, subject }) {
  const middle = failure
    ? [
        quoted(failure.messages),
        entryLine(failure),
        NOTHING_IS_BROKEN,
        '',
        `**What to do.** Open the CMS at ${CMS_URL}, go back into that entry, ` +
          'change what is asked for above, and save. That is all there is ' +
          'to it: the website rebuilds itself a few minutes after that save and ' +
          'publishes on its own, and this page closes itself when it does. If the ' +
          'message does not make sense to you, send this page to whoever maintains ' +
          'the site.',
      ]
    : [
        'The rebuild stopped before publishing, and not on anything typed in the ' +
          'CMS: no entry was named and no field was refused. **This is not ' +
          'something you did wrong**, and there is nothing to correct in a form.',
        '',
        NOTHING_IS_BROKEN,
        '',
        '**What to do.** This one is for whoever maintains the site: the reason ' +
          `is in [the full record of the attempt](${runUrl}), under the step that ` +
          'went red. Once it is fixed, the website publishes itself and this page ' +
          'closes.',
      ];
  return [
    `${mention} — the change just saved has not gone live. The website was not updated.`,
    '',
    ...middle,
    '',
    '---',
    commitNote({ sha, subject, commitUrl, runUrl }),
    '<sub>Opened by the publish workflow. Every failed publish reuses this page ' +
      'rather than opening another one.</sub>',
  ].join('\n');
}

/**
 * What is added when it happens again. The body above is rewritten at the same
 * time, but editing a body notifies nobody: a comment is what reaches the person
 * who made the new save, and there is one comment per failed run.
 */
export function repeatComment({ mention, failure, runUrl }) {
  const said = failure
    ? [quoted(failure.messages), entryLine(failure)]
    : ['The rebuild stopped again, for a technical reason rather than anything typed in the CMS.'];
  return [
    `${mention} — this has happened again with the save just made, so the website is still unchanged.`,
    '',
    ...said,
    '',
    `<sub>[The full record of that attempt](${runUrl})</sub>`,
  ].join('\n');
}

/** What is said when a later run publishes, just before the issue is closed. */
export function recoveryComment({ mention, runUrl }) {
  return [
    `${mention} — this is fixed. The website has been rebuilt and published, and ` +
      'it now shows the change. Give it a moment and refresh the page.',
    '',
    `<sub>Closed by the publish workflow after [this run](${runUrl}).</sub>`,
  ].join('\n');
}

/**
 * Who to address. `head_commit.author.username` is the GitHub account Pages CMS
 * committed as, which is the volunteer who pressed Save; GITHUB_ACTOR covers a
 * run started by hand from the Actions tab, where there is no head commit. A bot
 * login is written without the @, because there is nobody behind it to notify
 * and `[bot]` is not something a mention can hold.
 */
export function addressee(login, fallbackLogin) {
  const name = login || fallbackLogin || '';
  if (!name) return 'Whoever saved this';
  return name.endsWith('[bot]') ? `\`${name}\`` : `@${name}`;
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
      'user-agent': 'tedxkigali-publish-notice',
      'x-github-api-version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} answered ${response.status}: ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

async function main() {
  const result = process.env.PUBLISH_RESULT;
  // Anything but a finished run — a cancelled one, most likely — is not news.
  if (result !== 'success' && result !== 'failure') return;

  const repo = process.env.GITHUB_REPOSITORY;
  const server = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const runUrl = `${server}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = eventPath && existsSync(eventPath) ? JSON.parse(readFileSync(eventPath, 'utf8')) : {};
  const commit = event.head_commit || null;
  const sha = (commit && commit.id) || process.env.GITHUB_SHA || '';
  const mention = addressee(commit && commit.author && commit.author.username, process.env.GITHUB_ACTOR);

  // Only the issues this workflow opened carry the label, and only one of them
  // is ever open, so the first hit is the page to reuse.
  const open = await api(`/repos/${repo}/issues?state=open&labels=${ISSUE_LABEL}&per_page=1`);
  const existing = open.find((issue) => !issue.pull_request) || null;

  if (result === 'success') {
    if (!existing) return;
    await api(`/repos/${repo}/issues/${existing.number}/comments`, {
      method: 'POST',
      body: { body: recoveryComment({ mention, runUrl }) },
    });
    await api(`/repos/${repo}/issues/${existing.number}`, {
      method: 'PATCH',
      body: { state: 'closed', state_reason: 'completed' },
    });
    return;
  }

  const failure = editorFailure(failingLog(process.env.RUNNER_TEMP || '.'));
  const body = issueBody({
    mention,
    failure,
    runUrl,
    commitUrl: sha ? `${server}/${repo}/commit/${sha}` : null,
    sha,
    subject: (commit && commit.message) || '',
  });

  if (existing) {
    // The body is rewritten so that the top of the page is the current mistake
    // rather than the first one; the comment is what actually notifies.
    await api(`/repos/${repo}/issues/${existing.number}`, { method: 'PATCH', body: { body } });
    await api(`/repos/${repo}/issues/${existing.number}/comments`, {
      method: 'POST',
      body: { body: repeatComment({ mention, failure, runUrl }) },
    });
    return;
  }

  // Created before the issue rather than left to be created with it: a label
  // that already exists answers 422, which is nothing to act on, and any other
  // answer is a real failure worth stopping for.
  try {
    await api(`/repos/${repo}/labels`, {
      method: 'POST',
      body: {
        name: ISSUE_LABEL,
        color: 'd73a4a',
        description: 'A save that did not reach the website',
      },
    });
  } catch (error) {
    if (!/answered 422/.test(String(error.message))) throw error;
  }

  await api(`/repos/${repo}/issues`, {
    method: 'POST',
    body: { title: ISSUE_TITLE, body, labels: [ISSUE_LABEL] },
  });
}

// Only when run as the script; importing it from the tests must do nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
