# Final review — fix wave

All items below are to be fixed in one pass. Group A is blocking. Group B follows.
Items marked DEFERRED are explicitly **not** in scope — do not touch them.

Verify after every group: `npm test`, `npm run check` (0 errors, 0 warnings, 0 hints), `npm run build`.

---

## Group A — Critical

### A1. `/events/[slug]` never withdraws the booking button

`src/pages/events/[slug].astro` computes `state` at build time and never re-checks it in the
browser. It carries `data-booking` but none of the `data-event*` attributes, and does not import
`~/scripts/event-status.ts`. So on a site not rebuilt since before an event — the normal state
between editions — `/` and `/events` correctly archive it while the event's **own** page still says
"Tickets on sale" with a live booking button. A visitor clicking the archived card lands one click
later on a page selling tickets to a past event. `docs/EDITING.md` promises this cannot happen.

Fix: give the booking block the same DOM contract `EventCard.astro` uses —
`data-event`, `data-event-start`, `data-event-end` (from `eventEnd(...)`, ISO), `data-booking` on the
anchor — and import `~/scripts/event-status.ts` on the page. The ticket-status line must be corrected
too, not only the button: when the script decides the event is past, the page must not still read
"Tickets on sale". Add `data-ticket-status-label` (or equivalent) and have `event-status.ts` blank or
replace it for past events; keep the mechanism generic, not `[slug]`-specific.

**Prove it:** state in your report what a visitor sees on `/events/tedxkigali-2026` after that event
has ended, tracing the actual script.

### A2. Hiding an event with "Hide from the website" produces a 404

`src/pages/speakers.astro` resolves speaker → talk → edition with `getEntry`, which returns drafts,
then links `/events/<id>`. `getStaticPaths` in `[slug].astro` excludes drafts. So the link points at a
page that was never built. `docs/EDITING.md` actively recommends the draft toggle to postpone an event.

Fix: filter drafts wherever an entry is resolved for linking. Then close the class properly — see B12,
the build-time reference guard, which must also cover this case.

---

## Group B — Important

### B1. URL validation messages are Zod defaults, not plain English

Spec §4.2 makes editor-facing validation messages binding. Five fields use bare `z.url()`:
`events.bookingUrl`, `events.mapUrl`, `settings.socials[].url`, `sponsors.url`,
`speakers.links[].url`. Pasting `www.eventbrite.com/e/12345` — copying a link without the scheme, the
likeliest mistake — yields `bookingUrl: Invalid URL` plus a stack trace, naming a field the editor
never sees (the CMS label is "Booking link").

Fix: create `src/lib/content-messages.ts` holding the editor-facing strings, and give every `z.url()`
a message from it. Wording along the lines of: *"This does not look like a complete web address. Copy
the whole link from your browser's address bar — it must start with https://"*. Unit-test the module
(the messages must be non-empty, mention `https://`, and contain no field names or jargon) — this is
the testable half of the integration tests spec §16 asks for.

### B2. The About page cannot be edited, though the guide says it can

`src/pages/about.astro` hardcodes its three body sections; only the one-line `aboutShort` comes from
settings. `docs/EDITING.md` tells editors to change About text under "Site texts". Spec §5.5 lists a
long About text.

Fix: add `aboutBody` to `siteSettingsSchema` and to `.pages.yml` (a `text` field, label "About page
text", with help text saying blank lines start a new paragraph), seed it in `site.json` with the
current prose, and render it as paragraphs on the About page. Keep `aboutShort` for the home page.

DEFERRED, do not add: `heroImage` and a default social image — both need real artwork from the client.

### B3. The video player is clipped on a phone held sideways

`VideoDialog.astro` constrains width only; with the UA default `max-height` the fixed `aspect-video`
frame plus the header exceeds the available height on a landscape phone, so the video is cut and the
dialog scrolls internally. Landscape is how people watch video, on the project's primary device class.

Fix: constrain by height as well, e.g. `w-[min(96vw,calc((85vh-3.5rem)*16/9))]`, and verify the
arithmetic against the actual header height in the component. Report the viewport sizes you reasoned about.

### B4. The privacy page still contains one false sentence

`src/pages/privacy.astro` correctly says the preview image loads from `i.ytimg.com`, then says
*"Pressing play is your choice, and it is the only way this site contacts YouTube."* `i.ytimg.com` is
Google, and it is contacted on load. This page is legally load-bearing.

Fix: reword so the true position is stated — thumbnails come from a YouTube image server on page load;
no cookies and no analytics; the video player itself, and anything it stores, only loads on click. Read
the whole page again afterwards, aloud if it helps, and confirm no other sentence overstates.

### B5. "Watch the talk" does not reach a talk

`speakers.astro` links to the edition page, or to the whole archive when the talk has no edition.
Nothing on the site can address a single talk.

Fix: give `TalkCard`'s root element `id={talk.id}` and link `/talks#<id>`. Fall back to `/talks` only
when the speaker has no talk at all.

### B6. Sitemap and canonical disagree on trailing slashes

Canonical emits `/talks`, the sitemap `/talks/`. Fix: `sitemap({ trailingSlash: false })` in
`astro.config.mjs`. Confirm in `dist/sitemap-0.xml`.

### B7. `event-status.ts` re-derives the boundary its tests exist to protect

It inlines the upcoming/live/past comparison instead of importing `eventState` from `~/lib/events`,
whose tests were deliberately hardened so that flipping `<=` to `<` fails. That mutation would pass
silently in the client copy. `eventState` is pure and already bundles (the duration constant is
imported from the same module).

Fix: import and call `eventState`. Behaviour must be identical — confirm the built `data-event-end`
values and the archive behaviour are unchanged.

### B8. `npm run check` is not enforced in CI

`.github/workflows/ci.yml` runs `ci`, `test`, `build`. Add `npm run check`. Nothing else about the
workflow changes — no schedule, ever.

### B9. No favicon

`public/` holds only `robots.txt`. Every page 404s `/favicon.ico` and shows a blank tab icon.

Fix: add a small self-authored `public/favicon.svg` — a black square with the TED red `x` mark, using
`#EB0028` on `#0A0A0A`, no external assets — and reference it from `BaseLayout`. Include a
`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

DEFERRED: the default social preview image, which needs real artwork.

### B10. Redundant heading level on the home partners strip

`SponsorGrid` emits `<h2>` per tier; on the home page that sits beside the section's own `<h2>`.
Fix: make the tier heading level a prop, `<h2>` on `/partners` and `<h3>` on the home strip.

### B11. Filter group is mislabelled, and its empty state is wrong

`talks.astro` labels the filter group "Filter talks by edition" but it now also contains the tag
buttons, and `#talks-empty` reads "No talks in this edition yet." though it is the empty state for tag
filters too.

Fix: relabel the group to cover both, and make the empty-state text neutral, e.g. "No talks match this
filter yet."

### B12. A talk pointing at a missing or hidden edition fails silently

A dangling `edition` reference builds green and renders a filter button labelled with the raw slug;
a draft edition produces a link to a page that does not exist (A2). The project's promise is that
content mistakes fail the build loudly rather than degrading the live site.

Fix: add a build-time guard — a shared helper used by the pages that resolve editions, which throws an
editor-friendly error naming the talk and the missing edition, e.g. *"Talk 'the-market-at-dawn' points
at the event 'tedxkigali-2027', which does not exist or is hidden. Open the talk in the CMS and pick an
edition from the list."* Cover both cases: absent, and present but `draft: true`.

**Prove it:** temporarily point a sample talk at a non-existent edition, show the build failing with
your message, restore, rebuild green, and show `git status` clean before committing.

### B13. Shared date formatting

The `en-GB` / `Africa/Kigali` `Intl.DateTimeFormat` block is duplicated verbatim in `EventCard.astro`
and `events/[slug].astro`. It is the one value a reader actually sees, and this project centralises
constants elsewhere with comments explaining the failure they prevent.

Fix: a single formatter in `src/lib/events.ts` (or a small `src/lib/dates.ts`), used by both, with a
comment saying why the timezone is pinned. Add a unit test that a known instant renders in Kigali time
regardless of the machine timezone.

### B14. Small cleanups

- Remove `data-year` from `TalkCard` — no filter reads it, and leaving it implies a filter that does
  not exist.
- Deduplicate `(a.data.order ?? 9999)` between `SponsorGrid.astro` and `speakers.astro`.
- Import `@fontsource-variable/inter/latin.css` instead of the full package (six unused `@font-face`
  blocks otherwise).
- Add `avif` to `.pages.yml`'s media `extensions`, matching `content.config.ts`.
- Add a one-line comment on `events/index.astro`'s two section containers explaining they deliberately
  omit `data-event-section`, or the archive would hide itself.

---

## Group C — deferred minors to fix now (from the triage)

### C1. Tag hygiene at the schema level
`tags: z.array(z.string())` allows a tag containing `|` (breaks the filter the same way the old space
delimiter did — the talk vanishes from its own tag, build green) and an empty tag (renders a visible
empty pill with no accessible name, WCAG 4.1.2).

Fix: `z.array(z.string().trim().min(1).refine(t => !t.includes('|'), { message: ... }))` with an
editor-facing message from `content-messages.ts`. Reproduce both failures before and after, and show it.

### C2. `.strict()` on every schema
Forty-plus field names are hand-maintained across `.pages.yml` and the Zod schemas with no test. A
rename that drifts apart currently means the CMS writes a key nobody reads and the value silently
vanishes, with a green build.

Fix: apply `.strict()` to all four collections and `siteSettingsSchema`. Note the ordering constraint:
`.strict()` goes on the `z.object(...)` before `.refine(...)`. Confirm the build still passes on the
existing sample content — if any Astro-injected key trips it, stop and report rather than removing the
guard.

### C3. `order` accepts a decimal
`order` is `.int()` in Zod but `type: number` in the CMS, and the help text says "Lower numbers appear
first" — so a volunteer slotting someone between 1 and 2 types `1.5` and breaks the build. Drop
`.int()`; the sort works with floats. Both `speakers` and `sponsors`.

### C4. Edition buttons sort by title, not by date
`talks.astro` sorts the edition filter buttons by `title.localeCompare` descending, which is only
chronological because every title happens to begin `TEDxKigali <year>`. Sort by the event's `startDate`
instead — the page already loads the full `events` collection.

### C5. Two YouTube test gaps
Add to `src/lib/youtube.test.ts`: a rejected lookalike host (`https://notyoutube.com/watch?v=...` and
`https://youtube.com.evil.com/watch?v=...`), guarding the exact-match host check against a future
"simplify to `endsWith`" refactor; and an assertion that `YOUTUBE_HELP_MESSAGE` is non-empty and names
a full YouTube URL, since `docs/EDITING.md` quotes it.

---

## Explicitly DEFERRED — do not touch

- Default social preview image and hero photography (need real artwork from the client).
- The Kigali colour accents and photographic finish (`--color-kigali-green`, `--color-kigali-sky`
  unused) — blocked on client material.
- Full build-failure integration tests spawning `astro build` (spec §16) — B1's message tests cover the
  testable half; the rest is recorded as a known gap.
- Anything requiring the GitHub repository, the live CMS, the domain or real content.
- `.nvmrc`, `if (!found)`, `aria-current` boundary, `preventDefault` no-op, `'RWF'` constant,
  Windows-backslash message, SpeakerCard typography, the O(n·m) section rule, and the remaining
  deferred minors listed in `progress.md`.
