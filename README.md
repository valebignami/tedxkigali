# TEDxKigali website

Static website for TEDxKigali: talks that play in the page, events that link to
an external ticketing platform, and content edited through a form-based CMS by
people who do not write code.

There is no backend. Ticketing lives on a third-party platform, videos live on
YouTube, and everything else is a file in this repository.

## Commands

Node 22 or later is required.

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on <http://localhost:4321> |
| `npm test` | Unit tests (Vitest) |
| `npm run check` | Type and template check (`astro check`) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

`npm run build` is also the content validator: a mistake in an event or a talk
fails the build with a message written for the editor rather than for a
developer. That is deliberate — a bad value never reaches the live site.

## Editing content

Editors do not clone this repository. They sign in at
<https://app.pagescms.org> with GitHub and fill in forms defined by
[`.pages.yml`](.pages.yml). Their guide is [docs/EDITING.md](docs/EDITING.md).

- Content: `src/content/` — `events/`, `talks/`, `speakers/`, `sponsors/` as
  Markdown, plus `settings/site.json` for the site-wide texts.
- Uploaded images: `src/assets/uploads/`.
- The shape of every field: `src/content.config.ts`. It is the authority —
  `.pages.yml` must match it field for field, or a value an editor types is
  silently discarded.

## How the video player works

Talks are on YouTube, but no YouTube player is loaded until someone presses
play. A page carries only the still preview image; the click creates the
iframe, and closing the dialog destroys it so the audio stops. This is why the
privacy page can say what it says — see `src/lib/youtube.ts` and
`src/components/VideoDialog.astro`.

## How a finished event withdraws itself

The site is static, so a page can be served long after it was built. Events
carry their dates in `data-` attributes and `src/scripts/event-status.ts`
re-checks them against the visitor's own clock: a finished event loses its
booking button and says so, without anyone rebuilding the site.

## Deployment

Published to GitHub Pages at <https://valebignami.github.io/tedxkigali/> by
`.github/workflows/pages.yml`, on every push to `main`. That workflow runs the
tests, `astro check` and the build before it uploads anything, so a red commit
cannot reach the public site. `.github/workflows/ci.yml` runs the same checks
on pull requests as well and publishes nothing. Neither is scheduled: GitHub
disables scheduled workflows after 60 days without repository activity, which
for a volunteer-run site is a normal autumn.

One switch in the repository settings is needed once, by hand, and cannot be
done from here: **Settings → Pages → Build and deployment → Source → GitHub
Actions**. Until that is set, the deploy job fails with a permissions error.

The address is temporary. GitHub Pages serves a project site from a sub-path,
so the whole site lives under `/tedxkigali/`, and every internal link is built
through `internalHref` in `src/lib/base-path.ts` to carry it. Moving to a real
domain is one line: `PUBLISHED_AT` at the top of `astro.config.mjs`.

## Documents

- Design spec: [`docs/superpowers/specs/2026-08-22-tedx-kigali-site-design.md`](docs/superpowers/specs/2026-08-22-tedx-kigali-site-design.md)
- Implementation plan, including the pre-launch checklist in Task 18:
  [`docs/superpowers/plans/2026-08-22-tedx-kigali-site.md`](docs/superpowers/plans/2026-08-22-tedx-kigali-site.md)
- Build decisions and review findings: `docs/superpowers/2026-08-23-*.md`

## Before going live

The site currently ships **sample content**: three invented editions, three
talks pointing at the same placeholder video, one invented speaker profile, and
a booking link to `example-ticketing.com`. Nothing on the page says so. Task 18
of the plan lists every file to delete and every value to replace — work
through it before the domain is connected, not after.
