# TEDx Kigali Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire il sito statico di TEDx Kigali: archivio dei talk YouTube riproducibili senza lasciare il sito, eventi con link alla biglietteria esterna, tutto aggiornabile da una persona non tecnica tramite un CMS visuale su Git.

**Architecture:** Astro 7 in output statico puro, contenuti in file Markdown/JSON nel repo validati da schemi Zod, immagini ottimizzate dalla pipeline di Astro, JavaScript vanilla minimo (player video, stato eventi, filtri, menu). Nessun backend: la biglietteria è esterna e il CMS (Pages CMS) scrive direttamente sul repo GitHub. Deploy statico su Vercel.

**Tech Stack:** Astro 7, TypeScript strict, Tailwind CSS 4 (plugin Vite), Vitest 4, `@astrojs/sitemap`, `@fontsource-variable/inter`, Pages CMS, GitHub Actions, Vercel.

**Spec:** [`docs/superpowers/specs/2026-08-22-tedx-kigali-site-design.md`](../specs/2026-08-22-tedx-kigali-site-design.md)

## Global Constraints

Valgono per **ogni** task; non vanno ripetuti nei singoli requisiti.

- **Lingua**: tutto ciò che è visibile a un utente o a un redattore — testi del sito, etichette e testi di aiuto del CMS, messaggi di errore di validazione, `docs/EDITING.md` — è **in inglese**. Commenti nel codice in inglese. Questo piano e la spec sono in italiano.
- **Node 22.12 o superiore**, npm. Nessun altro package manager. (Astro 7 ha abbandonato Node 18 e 20.)
- **Zod 4**: `astro/zod` espone Zod 4, dove `z.string().url()` e `z.string().email()` sono deprecati. Usare `z.url()` e `z.email()`.
- **Zod si importa da `astro/zod`**, mai da `astro:content` (rimosso in Astro 6) e mai dal pacchetto `zod` autonomo: `astro/zod` è risolvibile anche dentro Vitest, quindi vale sia negli schemi delle collection sia nei moduli di libreria.
- **I blocchi JSON-LD portano `is:inline`**: `<script type="application/ld+json" is:inline set:html={...}></script>`. Senza `is:inline` Astro tratta il tag come script da processare ed emette un hint in `astro check`, moltiplicato per ogni pagina che ne contiene uno.
- **Nessun tag auto-chiuso per elementi non-void**: `<script ...></script>`, mai `<script ... />`. Il compilatore Rust di Astro 7 rifiuta l'HTML semanticamente invalido e non lo corregge più in automatico.
- **Nessun backend, nessuna funzione serverless, nessuna API route.** L'output di build deve essere solo file statici.
- **Nessuna richiesta a domini terzi al caricamento della pagina.** Font ospitati localmente; l'unica risorsa esterna ammessa prima di un clic è la miniatura YouTube da `i.ytimg.com`. Nessun analytics.
- **Embed video**: solo `https://www.youtube-nocookie.com/embed/<id>`, inserito nel DOM **dopo** il clic dell'utente e rimosso alla chiusura.
- **Colore**: `#EB0028` (rosso TED) è vietato per il testo di dimensioni normali e per i link inline; ammesso solo per titoli grandi, sfondi di pulsanti con testo bianco, bordi, linee e icone.
- **Immagini da CMS**: risiedono in `src/assets/uploads/`, mai in `public/`. Ogni immagine mostrata deve avere un testo alternativo.
- **Footer obbligatorio su ogni pagina** (licenza TEDx): la spiegazione `x = independently organized TED event` e la frase `This independent TEDx event is operated under license from TED.`, entrambe lette da `src/content/settings/site.json`.
- **Nome del marchio**: si scrive `TEDxKigali`, senza spazio.
- **Accessibilità**: obiettivo WCAG 2.1 AA. Focus sempre visibile, navigazione da tastiera completa, `prefers-reduced-motion` rispettato.
- **Budget**: home < 150 KB trasferiti escluse le immagini; Lighthouse mobile ≥ 95 nelle quattro categorie.
- **Commit**: uno per task, in inglese, con prefisso `feat:` / `test:` / `chore:` / `docs:` / `fix:`.

---

## Struttura dei file

| File | Responsabilità |
|---|---|
| `astro.config.mjs` | Configurazione Astro: `site`, sitemap, plugin Tailwind |
| `src/styles/global.css` | Design token (`@theme`) e stili di base |
| `src/lib/youtube.ts` | Parsing dei link YouTube, URL di embed e miniature |
| `src/lib/events.ts` | Calcolo dello stato di un evento (upcoming/live/past) e prenotabilità |
| `src/lib/images.ts` | Risoluzione dei percorsi immagine del CMS in asset Astro |
| `src/lib/content-rules.ts` | Regole di validazione condivise fra schemi e test |
| `src/lib/settings.ts` | Lettura e validazione di `settings/site.json` |
| `src/lib/seo.ts` | Costruzione di titolo, descrizione, canonical, meta social |
| `src/content.config.ts` | Definizione delle collection e degli schemi Zod |
| `src/layouts/BaseLayout.astro` | Scheletro HTML, `<head>`, header, footer, dialog video |
| `src/components/*.astro` | Header, Footer, TalkCard, EventCard, SpeakerCard, SponsorGrid, VideoDialog, EventJsonLd, VideoJsonLd |
| `src/scripts/*.ts` | `video-dialog.ts`, `event-status.ts`, `talk-filters.ts`, `nav.ts` |
| `src/pages/*.astro` | Le rotte del sito |
| `.pages.yml` | Configurazione del CMS |
| `.github/workflows/ci.yml` | Test e build su push e pull request |
| `docs/EDITING.md` | Guida per la redazione (inglese) |

---

## Task 1: Scaffolding del progetto

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.nvmrc`, `src/styles/global.css`, `src/pages/index.astro`, `src/assets/uploads/.gitkeep`

**Interfaces:**
- Consumes: niente (primo task)
- Produces: script npm `dev`, `build`, `preview`, `test`; token CSS Tailwind (`--color-bg`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-ted-red`, `--color-kigali-green`, `--color-kigali-sky`, `--color-kigali-sun`); alias TypeScript `~/*` → `src/*`

- [ ] **Step 1: Inizializzare il repository Git locale**

```bash
git init
git branch -M main
```

Il repository remoto su GitHub verrà collegato nel Task 18; per ora i commit restano locali.

- [ ] **Step 2: Creare il progetto Astro nella cartella corrente**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston
```

Se il comando segnala che la cartella non è vuota, confermare di procedere: i file `docs/` esistenti non vanno rimossi.

- [ ] **Step 3: Installare le dipendenze**

```bash
npm install
npm install astro@^7 @astrojs/sitemap @fontsource-variable/inter
npm install -D tailwindcss @tailwindcss/vite vitest @astrojs/check typescript
```

- [ ] **Step 4: Scrivere `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Replace with the final domain before the first production deploy (Task 18).
  site: 'https://tedxkigali.rw',
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 5: Scrivere `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  }
}
```

- [ ] **Step 6: Scrivere `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 7: Aggiungere gli script npm**

In `package.json`, sostituire il blocco `scripts` con:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run --passWithNoTests",
  "check": "astro check"
}
```

- [ ] **Step 8: Scrivere `src/styles/global.css` con i design token**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0A0A0A;
  --color-surface: #161616;
  --color-line: #2A2A2A;
  --color-ink: #FFFFFF;
  --color-muted: #A3A3A3;
  --color-ted-red: #EB0028;
  --color-kigali-green: #2E7D5B;
  --color-kigali-sky: #3B7EA1;
  --color-kigali-sun: #E8B44A;

  --font-sans: "Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
    background-color: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-text-size-adjust: 100%;
  }

  body { margin: 0; }

  :focus-visible {
    outline: 3px solid var(--color-kigali-sun);
    outline-offset: 3px;
  }

  /* NOTE: #EB0028 on a dark background is below the AA contrast ratio for
     normal-size text. Use it for large headings, button fills, borders and
     icons only — never for body copy or inline links. */

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 9: Sostituire `src/pages/index.astro` con una pagina temporanea**

```astro
---
import '~/styles/global.css';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TEDxKigali</title>
  </head>
  <body class="bg-bg text-ink">
    <h1 class="p-8 text-4xl font-bold uppercase">TEDxKigali</h1>
  </body>
</html>
```

- [ ] **Step 10: Creare `.nvmrc` e la cartella upload**

```bash
echo "22" > .nvmrc
mkdir -p src/assets/uploads
touch src/assets/uploads/.gitkeep
```

- [ ] **Step 11: Verificare che build e test girino**

```bash
npm run build
npm test
```

Attesi: build completato senza errori con `dist/index.html` generato; `npm test` esce con codice 0 (nessun test presente per ora).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with Tailwind, Vitest and design tokens"
```

---

## Task 2: Parsing dei link YouTube

**Files:**
- Create: `src/lib/youtube.ts`
- Test: `src/lib/youtube.test.ts`

**Interfaces:**
- Consumes: niente
- Produces:
  - `parseYouTubeId(input: string): string | null`
  - `youtubeEmbedUrl(id: string): string`
  - `youtubeThumbnails(id: string): { primary: string; fallback: string }`
  - `youtubeWatchUrl(id: string): string`
  - `YOUTUBE_HELP_MESSAGE: string` (messaggio di errore in inglese, usato dagli schemi nel Task 5)

- [ ] **Step 1: Scrivere i test che falliscono**

Creare `src/lib/youtube.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  parseYouTubeId,
  youtubeEmbedUrl,
  youtubeThumbnails,
  youtubeWatchUrl,
} from '~/lib/youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeId', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?t=42`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/v/${ID}`,
    `youtube.com/watch?v=${ID}`,
    `  https://www.youtube.com/watch?v=${ID}  `,
    ID,
  ])('accepts %s', (input) => {
    expect(parseYouTubeId(input)).toBe(ID);
  });

  it.each([
    '',
    '   ',
    'not a url',
    'https://vimeo.com/123456',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/',
    'https://www.youtube.com/watch?v=tooshort',
    'https://www.youtube.com/watch?v=waaaaaaaaaytoolong',
    'https://www.youtube.com/@tedxkigali',
  ])('rejects %s', (input) => {
    expect(parseYouTubeId(input)).toBeNull();
  });
});

describe('url builders', () => {
  it('builds a privacy-friendly autoplay embed url', () => {
    const url = new URL(youtubeEmbedUrl(ID));
    expect(url.origin).toBe('https://www.youtube-nocookie.com');
    expect(url.pathname).toBe(`/embed/${ID}`);
    expect(url.searchParams.get('autoplay')).toBe('1');
    expect(url.searchParams.get('rel')).toBe('0');
    expect(url.searchParams.get('playsinline')).toBe('1');
    expect(url.searchParams.get('modestbranding')).toBe('1');
  });

  it('builds both thumbnail urls', () => {
    expect(youtubeThumbnails(ID)).toEqual({
      primary: `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`,
      fallback: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`,
    });
  });

  it('builds the canonical watch url', () => {
    expect(youtubeWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "~/lib/youtube"`.

- [ ] **Step 3: Implementare `src/lib/youtube.ts`**

```ts
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
]);

const PATH_PREFIXES = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/;

/** Message shown to editors when a YouTube link cannot be understood. */
export const YOUTUBE_HELP_MESSAGE =
  'YouTube link not recognised. Copy the full link from your browser address bar, for example https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function asId(candidate: string | null | undefined): string | null {
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Accepts every common YouTube link shape (and a bare video id). */
export function parseYouTubeId(input: string): string | null {
  const raw = (input ?? '').trim();
  if (raw === '') return null;
  if (VIDEO_ID.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(?:www|m)\./, '');
  if (!ALLOWED_HOSTS.has(host)) return null;

  if (host === 'youtu.be') return asId(url.pathname.slice(1).split('/')[0]);

  const fromQuery = asId(url.searchParams.get('v'));
  if (fromQuery) return fromQuery;

  return asId(url.pathname.match(PATH_PREFIXES)?.[1]);
}

export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbnails(id: string): { primary: string; fallback: string } {
  return {
    // maxresdefault does not exist for every video: the card falls back to
    // hqdefault, which YouTube always generates.
    primary: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    fallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npm test`
Expected: PASS — tutti i casi di `youtube.test.ts` verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/youtube.ts src/lib/youtube.test.ts
git commit -m "feat: parse YouTube links and build embed and thumbnail urls"
```

---

## Task 3: Stato degli eventi nel tempo

**Files:**
- Create: `src/lib/events.ts`
- Test: `src/lib/events.test.ts`

**Interfaces:**
- Consumes: niente
- Produces:
  - `type EventState = 'upcoming' | 'live' | 'past'`
  - `TICKET_STATUSES` (tupla `as const`) e `type TicketStatus = (typeof TICKET_STATUSES)[number]`
  - `DEFAULT_EVENT_DURATION_MS: number`
  - `eventEnd(start: Date, end?: Date | null): Date`
  - `eventState(start: Date, end: Date | null | undefined, now: Date): EventState`
  - `isBookable(state: EventState, ticketStatus: TicketStatus): boolean`
  - `ticketStatusLabel(status: TicketStatus): string`

- [ ] **Step 1: Scrivere i test che falliscono**

Creare `src/lib/events.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EVENT_DURATION_MS,
  eventEnd,
  eventState,
  isBookable,
  ticketStatusLabel,
} from '~/lib/events';

// All fixtures use the Africa/Kigali offset (+02:00) written explicitly,
// so the tests are independent of the machine timezone.
const start = new Date('2026-11-14T09:00:00+02:00');
const end = new Date('2026-11-14T18:00:00+02:00');

describe('eventEnd', () => {
  it('uses the explicit end date when present', () => {
    expect(eventEnd(start, end).toISOString()).toBe(end.toISOString());
  });

  it('defaults to four hours after the start', () => {
    expect(eventEnd(start).getTime()).toBe(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  });

  it('ignores an end date that precedes the start', () => {
    const broken = new Date('2026-11-13T09:00:00+02:00');
    expect(eventEnd(start, broken).getTime()).toBe(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  });
});

describe('eventState', () => {
  it('is upcoming before the start', () => {
    expect(eventState(start, end, new Date('2026-11-13T23:59:00+02:00'))).toBe('upcoming');
  });

  it('is live between start and end', () => {
    expect(eventState(start, end, new Date('2026-11-14T12:00:00+02:00'))).toBe('live');
  });

  it('is live exactly at the start', () => {
    expect(eventState(start, end, start)).toBe('live');
  });

  // The decisive boundary: at this exact instant the booking button must still
  // be there, one millisecond later it must be gone. Without both assertions,
  // flipping <= to < would pass the whole suite.
  it('is still live at the exact end instant', () => {
    expect(eventState(start, end, end)).toBe('live');
  });

  it('is past one millisecond after the end instant', () => {
    expect(eventState(start, end, new Date(end.getTime() + 1))).toBe('past');
  });

  it('is past after the end', () => {
    expect(eventState(start, end, new Date('2026-11-14T18:00:01+02:00'))).toBe('past');
  });

  it('is past just after midnight in Kigali when the event ended the day before', () => {
    expect(eventState(start, end, new Date('2026-11-15T00:30:00+02:00'))).toBe('past');
  });

  it('falls back to the default duration when no end date is given', () => {
    expect(eventState(start, null, new Date('2026-11-14T12:00:00+02:00'))).toBe('live');
    expect(eventState(start, null, new Date('2026-11-14T13:30:00+02:00'))).toBe('past');
  });

  it('applies the same end boundary to the default duration', () => {
    const defaultEnd = new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
    expect(eventState(start, null, defaultEnd)).toBe('live');
    expect(eventState(start, null, new Date(defaultEnd.getTime() + 1))).toBe('past');
  });

  it('stays past well after a malformed end date that precedes the start', () => {
    const broken = new Date('2026-11-13T09:00:00+02:00');
    expect(eventState(start, broken, new Date('2026-11-14T10:00:00+02:00'))).toBe('live');
    expect(eventState(start, broken, new Date('2026-11-15T00:30:00+02:00'))).toBe('past');
  });
});

describe('isBookable', () => {
  it('allows booking for upcoming events with tickets on sale', () => {
    expect(isBookable('upcoming', 'open')).toBe(true);
    expect(isBookable('upcoming', 'free')).toBe(true);
  });

  it('blocks booking once the event is over', () => {
    expect(isBookable('past', 'open')).toBe(false);
  });

  it('blocks booking for statuses that are not on sale', () => {
    expect(isBookable('upcoming', 'sold-out')).toBe(false);
    expect(isBookable('upcoming', 'coming-soon')).toBe(false);
    expect(isBookable('upcoming', 'closed')).toBe(false);
  });

  it('still allows booking while the event is live', () => {
    expect(isBookable('live', 'open')).toBe(true);
  });
});

describe('ticketStatusLabel', () => {
  it('returns editor-facing English labels', () => {
    expect(ticketStatusLabel('coming-soon')).toBe('Tickets coming soon');
    expect(ticketStatusLabel('open')).toBe('Tickets on sale');
    expect(ticketStatusLabel('free')).toBe('Free entry — registration required');
    expect(ticketStatusLabel('sold-out')).toBe('Sold out');
    expect(ticketStatusLabel('closed')).toBe('Registrations closed');
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "~/lib/events"`.

- [ ] **Step 3: Implementare `src/lib/events.ts`**

```ts
export type EventState = 'upcoming' | 'live' | 'past';

// Single source of truth: the Zod enum in src/content.config.ts is built from
// this array, so adding a status here is enough to make it valid content.
export const TICKET_STATUSES = ['coming-soon', 'open', 'free', 'sold-out', 'closed'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** Events without an explicit end time are assumed to last four hours. */
export const DEFAULT_EVENT_DURATION_MS = 4 * 60 * 60 * 1000;

const ON_SALE: ReadonlySet<TicketStatus> = new Set<TicketStatus>(['open', 'free']);

const TICKET_LABELS: Record<TicketStatus, string> = {
  'coming-soon': 'Tickets coming soon',
  open: 'Tickets on sale',
  free: 'Free entry — registration required',
  'sold-out': 'Sold out',
  closed: 'Registrations closed',
};

export function eventEnd(start: Date, end?: Date | null): Date {
  if (end && end.getTime() > start.getTime()) return end;
  return new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
}

export function eventState(start: Date, end: Date | null | undefined, now: Date): EventState {
  if (now.getTime() < start.getTime()) return 'upcoming';
  if (now.getTime() <= eventEnd(start, end).getTime()) return 'live';
  return 'past';
}

export function isBookable(state: EventState, ticketStatus: TicketStatus): boolean {
  return state !== 'past' && ON_SALE.has(ticketStatus);
}

export function ticketStatusLabel(status: TicketStatus): string {
  return TICKET_LABELS[status];
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/events.ts src/lib/events.test.ts
git commit -m "feat: derive event state and bookability from dates and ticket status"
```

---

## Task 4: Risoluzione delle immagini caricate dal CMS

**Files:**
- Create: `src/lib/images.ts`
- Test: `src/lib/images.test.ts`

**Interfaces:**
- Consumes: niente
- Produces:
  - `UPLOADS_PREFIX = '/src/assets/uploads/'`
  - `normaliseUploadPath(value: string): string`
  - `pickImage<T>(map: Record<string, T>, value: string): T` — lancia un errore in inglese se il file manca
  - `resolveUploadedImage(value: string): ImageMetadata` — wrapper che usa `import.meta.glob`

Motivazione della separazione: `import.meta.glob` è una funzionalità di Vite non disponibile nei test Node puri. Le due funzioni pure sono testabili, il wrapper è una riga sola.

- [ ] **Step 1: Scrivere i test che falliscono**

Creare `src/lib/images.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normaliseUploadPath, pickImage, UPLOADS_PREFIX } from '~/lib/images';

describe('normaliseUploadPath', () => {
  it.each([
    'src/assets/uploads/hero.jpg',
    '/src/assets/uploads/hero.jpg',
    './src/assets/uploads/hero.jpg',
    'hero.jpg',
    '/hero.jpg',
    '  src/assets/uploads/hero.jpg  ',
  ])('normalises %s', (input) => {
    expect(normaliseUploadPath(input)).toBe(`${UPLOADS_PREFIX}hero.jpg`);
  });

  it('keeps sub-folders', () => {
    expect(normaliseUploadPath('src/assets/uploads/2026/hero.jpg')).toBe(
      `${UPLOADS_PREFIX}2026/hero.jpg`,
    );
  });
});

describe('pickImage', () => {
  const map = { [`${UPLOADS_PREFIX}hero.jpg`]: 'HERO_ASSET' };

  it('returns the matching asset', () => {
    expect(pickImage(map, 'src/assets/uploads/hero.jpg')).toBe('HERO_ASSET');
  });

  it('throws an editor-friendly error when the file is missing', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrow(
      /Image not found: src\/assets\/uploads\/missing\.jpg/,
    );
  });

  it('mentions how to fix the problem', () => {
    expect(() => pickImage(map, 'missing.jpg')).toThrow(/upload it again/i);
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "~/lib/images"`.

- [ ] **Step 3: Implementare `src/lib/images.ts`**

```ts
import type { ImageMetadata } from 'astro';

export const UPLOADS_PREFIX = '/src/assets/uploads/';

// This pattern MUST stay a string literal. Vite resolves import.meta.glob at
// build time by static analysis and cannot follow a variable or a template
// string, so this is the one place UPLOADS_PREFIX cannot be reused. Keep the
// two in sync by hand if the uploads folder ever moves.
const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true },
);

const STRIP_PREFIX = new RegExp(`^${UPLOADS_PREFIX.slice(1)}`);

/** Turns whatever the CMS stored into a repo-root absolute path. */
export function normaliseUploadPath(value: string): string {
  const trimmed = (value ?? '').trim().replace(/^\.?\//, '');
  return `${UPLOADS_PREFIX}${trimmed.replace(STRIP_PREFIX, '')}`;
}

export function pickImage<T>(map: Record<string, T>, value: string): T {
  const key = normaliseUploadPath(value);
  const found = map[key];
  if (!found) {
    throw new Error(
      `Image not found: ${key.slice(1)}. Open the item in the CMS and upload it again, ` +
        'then save. (The file must live in src/assets/uploads/.)',
    );
  }
  return found;
}

export function resolveUploadedImage(value: string): ImageMetadata {
  return pickImage(uploads, value).default;
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/images.ts src/lib/images.test.ts
git commit -m "feat: resolve CMS image paths to optimised Astro assets"
```

---

## Task 5: Collection, schemi e contenuti di esempio

**Files:**
- Create: `src/lib/content-rules.ts`, `src/lib/settings.ts`, `src/content.config.ts`, `src/content/settings/site.json`, `src/content/talks/2025-10-18-the-hills-that-listen.md`, `src/content/talks/2025-10-18-rebuilding-trust.md`, `src/content/events/tedxkigali-2026.md`, `src/content/events/tedxkigali-2025.md`
- Test: `src/lib/content-rules.test.ts`

**Interfaces:**
- Consumes: `parseYouTubeId`, `YOUTUBE_HELP_MESSAGE` (Task 2); `TICKET_STATUSES`, `TicketStatus` (Task 3)
- Produces:
  - `requiresBookingUrl(status: TicketStatus): boolean`
  - `BOOKING_URL_MESSAGE: string`
  - collection `talks`, `events` con i campi della spec §5
  - `siteSettings` (Task 6 legge i testi globali da qui)

- [ ] **Step 1: Scrivere i test che falliscono**

Creare `src/lib/content-rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { BOOKING_URL_MESSAGE, requiresBookingUrl } from '~/lib/content-rules';

describe('requiresBookingUrl', () => {
  it('requires a booking link when tickets are on sale', () => {
    expect(requiresBookingUrl('open')).toBe(true);
    expect(requiresBookingUrl('free')).toBe(true);
  });

  it('does not require one otherwise', () => {
    expect(requiresBookingUrl('coming-soon')).toBe(false);
    expect(requiresBookingUrl('sold-out')).toBe(false);
    expect(requiresBookingUrl('closed')).toBe(false);
  });
});

describe('BOOKING_URL_MESSAGE', () => {
  it('tells the editor exactly what to do', () => {
    expect(BOOKING_URL_MESSAGE).toMatch(/booking link/i);
    expect(BOOKING_URL_MESSAGE).toMatch(/Tickets on sale|Free entry/i);
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "~/lib/content-rules"`.

- [ ] **Step 3: Implementare `src/lib/content-rules.ts`**

```ts
import type { TicketStatus } from '~/lib/events';

export const BOOKING_URL_MESSAGE =
  'A booking link is required when the ticket status is "Tickets on sale" or ' +
  '"Free entry". Paste the link from your ticketing platform, or change the ticket status.';

export function requiresBookingUrl(status: TicketStatus): boolean {
  return status === 'open' || status === 'free';
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Scrivere `src/content.config.ts`**

```ts
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { parseYouTubeId, YOUTUBE_HELP_MESSAGE } from '~/lib/youtube';
import { TICKET_STATUSES } from '~/lib/events';
import { BOOKING_URL_MESSAGE, requiresBookingUrl } from '~/lib/content-rules';

const uploadPath = z
  .string()
  .refine((value) => /\.(jpe?g|png|webp|avif|svg)$/i.test(value.trim()), {
    message: 'Image file name must end with .jpg, .png, .webp, .avif or .svg.',
  });

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z
    .object({
      title: z.string().min(1),
      speaker: z.string().min(1),
      youtubeUrl: z.string().refine((value) => parseYouTubeId(value) !== null, {
        message: YOUTUBE_HELP_MESSAGE,
      }),
      date: z.coerce.date(),
      edition: reference('events').optional(),
      summary: z.string().max(300).optional(),
      thumbnail: uploadPath.optional(),
      thumbnailAlt: z.string().optional(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.thumbnail || (data.thumbnailAlt ?? '').trim() !== '', {
      message: 'Describe the cover image in "Cover image description" so screen readers can read it.',
      path: ['thumbnailAlt'],
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z
    .object({
      title: z.string().min(1),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      venue: z.string().min(1),
      address: z.string().optional(),
      mapUrl: z.url().optional(),
      image: uploadPath.optional(),
      imageAlt: z.string().optional(),
      theme: z.string().optional(),
      summary: z.string().min(1).max(300),
      bookingUrl: z.url().optional(),
      bookingLabel: z.string().default('Book your seat'),
      ticketStatus: z.enum(TICKET_STATUSES),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.image || (data.imageAlt ?? '').trim() !== '', {
      message: 'Describe the event image in "Image description" so screen readers can read it.',
      path: ['imageAlt'],
    })
    .refine((data) => !requiresBookingUrl(data.ticketStatus) || !!data.bookingUrl, {
      message: BOOKING_URL_MESSAGE,
      path: ['bookingUrl'],
    }),
});

export const collections = { talks, events };
```

- [ ] **Step 6: Scrivere `src/lib/settings.ts`**

```ts
// Import from 'astro/zod', not from 'astro:content': this module is also loaded
// by Vitest (through src/lib/seo.ts), where the astro: virtual modules do not
// exist, while 'astro/zod' is a normal package subpath that resolves anywhere.
import { z } from 'astro/zod';
import raw from '~/content/settings/site.json';

const socialLink = z.object({
  label: z.string().min(1),
  url: z.url(),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  aboutShort: z.string().min(1),
  contactEmail: z.email(),
  socials: z.array(socialLink).default([]),
  seoDescription: z.string().min(1).max(300),
  tedxLicenceNotice: z.string().min(1),
  tedxXExplanation: z.string().min(1),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// Parsed at build time: a malformed settings file fails the build instead of
// shipping a broken page.
export const siteSettings: SiteSettings = siteSettingsSchema.parse(raw);
```

- [ ] **Step 7: Scrivere `src/content/settings/site.json`**

```json
{
  "siteName": "TEDxKigali",
  "tagline": "Ideas worth spreading, from the heart of Rwanda",
  "heroTitle": "Ideas worth spreading, from the heart of Rwanda",
  "heroSubtitle": "TEDxKigali brings together thinkers, builders and storytellers shaping the future of Rwanda and the continent.",
  "aboutShort": "TEDxKigali is an independently organised TED event that gathers speakers from across Rwanda to share ideas worth spreading.",
  "contactEmail": "hello@tedxkigali.rw",
  "socials": [
    { "label": "Instagram", "url": "https://www.instagram.com/tedxkigali" },
    { "label": "X", "url": "https://x.com/tedxkigali" },
    { "label": "LinkedIn", "url": "https://www.linkedin.com/company/tedxkigali" },
    { "label": "YouTube", "url": "https://www.youtube.com/@tedxkigali" }
  ],
  "seoDescription": "Talks, speakers and events from TEDxKigali, an independently organised TED event in Kigali, Rwanda.",
  "tedxLicenceNotice": "This independent TEDx event is operated under license from TED.",
  "tedxXExplanation": "x = independently organized TED event"
}
```

> Gli indirizzi social e l'email sono valori di partenza: vanno confermati dal team di Kigali nel Task 18.

- [ ] **Step 8: Scrivere i contenuti di esempio**

`src/content/events/tedxkigali-2026.md`:

```markdown
---
title: "TEDxKigali 2026 — Rising"
startDate: 2026-11-14T09:00:00+02:00
endDate: 2026-11-14T18:00:00+02:00
venue: "Kigali Convention Centre"
address: "KG 2 Roundabout, Kigali, Rwanda"
mapUrl: "https://maps.app.goo.gl/"
theme: "Rising"
summary: "A full day of talks on how Rwanda is building what comes next, from climate innovation to storytelling."
bookingUrl: "https://example-ticketing.com/tedxkigali-2026"
bookingLabel: "Book your seat"
ticketStatus: "open"
---

TEDxKigali 2026 gathers speakers from across Rwanda and the region for a day of
talks, performances and conversations under the theme **Rising**.

Doors open at 08:00. Talks start at 09:00 sharp.
```

`src/content/events/tedxkigali-2025.md`:

```markdown
---
title: "TEDxKigali 2025 — Roots"
startDate: 2025-10-18T09:00:00+02:00
endDate: 2025-10-18T17:00:00+02:00
venue: "Kigali Public Library"
theme: "Roots"
summary: "Nine speakers on where we come from and what we carry forward."
ticketStatus: "closed"
---

The 2025 edition explored the theme **Roots**: identity, memory and the stories
that hold a community together.
```

`src/content/talks/2025-10-18-the-hills-that-listen.md`:

```markdown
---
title: "The hills that listen"
speaker: "Aline Uwase"
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
date: 2025-10-18
edition: "tedxkigali-2025"
summary: "What Rwanda's landscape can teach us about listening to each other."
featured: true
tags: ["community", "storytelling"]
---
```

`src/content/talks/2025-10-18-rebuilding-trust.md`:

```markdown
---
title: "Rebuilding trust, one conversation at a time"
speaker: "Jean-Paul Habimana"
youtubeUrl: "https://youtu.be/dQw4w9WgXcQ"
date: 2025-10-18
edition: "tedxkigali-2025"
summary: "A practical account of building trust inside communities that have every reason not to."
featured: true
tags: ["community"]
---
```

> I due esempi puntano volutamente allo stesso video segnaposto: verranno sostituiti con i talk reali nel Task 18.

- [ ] **Step 9: Verificare che il build accetti i contenuti validi**

Run: `npm run build`
Expected: build completato senza errori di validazione.

- [ ] **Step 10: Verificare che il build rifiuti i contenuti non validi**

```bash
sed -i 's|youtubeUrl: "https://youtu.be/dQw4w9WgXcQ"|youtubeUrl: "https://vimeo.com/12345"|' src/content/talks/2025-10-18-rebuilding-trust.md
npm run build
```

Expected: FAIL con il messaggio `YouTube link not recognised...` e il nome del file interessato.

Ripristinare e riverificare:

```bash
sed -i 's|youtubeUrl: "https://vimeo.com/12345"|youtubeUrl: "https://youtu.be/dQw4w9WgXcQ"|' src/content/talks/2025-10-18-rebuilding-trust.md
npm run build
```

Expected: PASS.

- [ ] **Step 11: Verificare la regola sul link di prenotazione**

```bash
sed -i 's|^bookingUrl: .*$||' src/content/events/tedxkigali-2026.md
npm run build
```

Expected: FAIL con il messaggio `A booking link is required when the ticket status is...`.

Ripristinare la riga `bookingUrl: "https://example-ticketing.com/tedxkigali-2026"` sotto `mapUrl` e rieseguire `npm run build`.
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add src/content.config.ts src/lib/content-rules.ts src/lib/content-rules.test.ts src/lib/settings.ts src/content
git commit -m "feat: define talk and event collections with editor-friendly validation"
```

---

## Task 6: Layout di base, header, footer e SEO

**Files:**
- Create: `src/lib/seo.ts`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`, `src/scripts/nav.ts`, `public/robots.txt`
- Modify: `src/pages/index.astro`
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `siteSettings` (Task 5)
- Produces:
  - `buildPageTitle(pageTitle?: string): string`
  - `canonicalUrl(pathname: string, site: URL | undefined): string`
  - `BaseLayout` con props `{ title?: string; description?: string; image?: string; noIndex?: boolean }` e slot di default
  - id DOM stabili: `#site-nav`, `#nav-toggle`

- [ ] **Step 1: Scrivere i test che falliscono**

Creare `src/lib/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildPageTitle, canonicalUrl, toJsonLd } from '~/lib/seo';

describe('buildPageTitle', () => {
  it('appends the site name', () => {
    expect(buildPageTitle('Talks')).toBe('Talks | TEDxKigali');
  });

  it('returns the site name and tagline on the home page', () => {
    expect(buildPageTitle()).toBe('TEDxKigali | Ideas worth spreading, from the heart of Rwanda');
  });
});

describe('canonicalUrl', () => {
  const site = new URL('https://tedxkigali.rw');

  it('builds an absolute url', () => {
    expect(canonicalUrl('/talks', site)).toBe('https://tedxkigali.rw/talks');
  });

  it('strips a trailing slash except at the root', () => {
    expect(canonicalUrl('/talks/', site)).toBe('https://tedxkigali.rw/talks');
    expect(canonicalUrl('/', site)).toBe('https://tedxkigali.rw/');
  });

  it('falls back to the pathname when no site is configured', () => {
    expect(canonicalUrl('/talks', undefined)).toBe('/talks');
  });
});

describe('toJsonLd', () => {
  it('serialises a payload', () => {
    expect(toJsonLd({ '@type': 'Event', name: 'Rising' })).toBe('{"@type":"Event","name":"Rising"}');
  });

  it('escapes < so an editor-typed closing tag cannot break out of the script', () => {
    const serialised = toJsonLd({ name: 'Talks </script><img onerror=alert(1)>' });
    expect(serialised).not.toContain('</script>');
    expect(serialised).toContain('\\u003c');
  });

  it('still round-trips to the original value', () => {
    const payload = { name: 'A < B', nested: { url: 'https://example.com' } };
    expect(JSON.parse(toJsonLd(payload))).toEqual(payload);
  });
});
```

- [ ] **Step 2: Eseguire i test e verificare che falliscano**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "~/lib/seo"`.

- [ ] **Step 3: Implementare `src/lib/seo.ts`**

```ts
import { siteSettings } from '~/lib/settings';

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${siteSettings.siteName} | ${siteSettings.tagline}`;
  return `${pageTitle} | ${siteSettings.siteName}`;
}

export function canonicalUrl(pathname: string, site: URL | undefined): string {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  return site ? new URL(clean, site).toString() : clean;
}

/**
 * Serialises a JSON-LD payload for embedding in a <script> tag.
 *
 * Escaping `<` is the point: every value in these blocks is text an editor
 * typed into the CMS, and a title containing `</script>` would otherwise close
 * the tag early and break the page. Editors cannot be expected to know that.
 */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Scrivere `src/scripts/nav.ts`**

```ts
const toggle = document.querySelector<HTMLButtonElement>('#nav-toggle');
const nav = document.querySelector<HTMLElement>('#site-nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('hidden', open);
});
```

- [ ] **Step 6: Scrivere `src/components/Header.astro`**

```astro
---
import { siteSettings } from '~/lib/settings';

const links = [
  { href: '/talks', label: 'Talks' },
  { href: '/events', label: 'Events' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/about', label: 'About' },
  { href: '/partners', label: 'Partners' },
];

const { pathname } = Astro.url;
---

<header class="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
    <a href="/" class="text-2xl font-black tracking-tight">
      <span class="text-ted-red">TED</span><span class="text-ink">x</span><span class="text-ink">Kigali</span>
      <span class="sr-only">— {siteSettings.tagline}</span>
    </a>

    <button
      id="nav-toggle"
      type="button"
      class="rounded border border-line px-3 py-2 text-sm uppercase md:hidden"
      aria-expanded="false"
      aria-controls="site-nav"
    >
      Menu
    </button>

    <nav id="site-nav" class="hidden w-full md:block md:w-auto" aria-label="Main">
      <ul class="flex flex-col gap-1 py-2 md:flex-row md:items-center md:gap-6 md:py-0">
        {links.map((link) => (
          <li>
            <a
              href={link.href}
              class="block py-2 text-sm font-semibold uppercase tracking-wide text-muted hover:text-ink aria-[current=page]:text-ink"
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<script>
  import '~/scripts/nav.ts';
</script>
```

- [ ] **Step 7: Scrivere `src/components/Footer.astro`**

```astro
---
import { siteSettings } from '~/lib/settings';
const year = new Date().getFullYear();
---

<footer class="mt-24 border-t border-line bg-surface">
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
    <div>
      <p class="text-xl font-black">
        <span class="text-ted-red">TED</span>xKigali
      </p>
      <p class="mt-2 text-sm text-muted">{siteSettings.tedxXExplanation}</p>
    </div>

    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide">Contact</h2>
      <p class="mt-2 text-sm">
        <a class="underline hover:no-underline" href={`mailto:${siteSettings.contactEmail}`}>
          {siteSettings.contactEmail}
        </a>
      </p>
      <ul class="mt-3 flex flex-wrap gap-4 text-sm">
        {siteSettings.socials.map((social) => (
          <li>
            <a class="underline hover:no-underline" href={social.url} rel="noopener noreferrer" target="_blank">
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    <div class="text-sm text-muted">
      <p>{siteSettings.tedxLicenceNotice}</p>
      <p class="mt-3">
        <a class="underline hover:no-underline" href="/privacy">Privacy</a>
      </p>
      <p class="mt-3">© {year} TEDxKigali</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 8: Scrivere `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/inter';
import '~/styles/global.css';
import Header from '~/components/Header.astro';
import Footer from '~/components/Footer.astro';
import { siteSettings } from '~/lib/settings';
import { buildPageTitle, canonicalUrl, toJsonLd } from '~/lib/seo';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const { title, description, image, noIndex = false } = Astro.props;

const pageTitle = buildPageTitle(title);
const pageDescription = description ?? siteSettings.seoDescription;
const canonical = canonicalUrl(Astro.url.pathname, Astro.site);

const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteSettings.siteName,
  description: siteSettings.seoDescription,
  url: Astro.site?.toString() ?? canonical,
  email: siteSettings.contactEmail,
  sameAs: siteSettings.socials.map((social) => social.url),
};
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={pageDescription} />
    <link rel="canonical" href={canonical} />
    {noIndex && <meta name="robots" content="noindex" />}

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={siteSettings.siteName} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDescription} />
    <meta property="og:url" content={canonical} />
    {image && <meta property="og:image" content={image} />}
    <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />

    <link rel="sitemap" href="/sitemap-index.xml" />
    <script type="application/ld+json" is:inline set:html={toJsonLd(organisationJsonLd)}></script>
    <slot name="head" />
  </head>

  <body class="flex min-h-screen flex-col bg-bg text-ink">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
    >
      Skip to content
    </a>

    <Header />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <Footer />
    <slot name="body-end" />
  </body>
</html>
```

- [ ] **Step 9: Aggiornare `src/pages/index.astro` per usare il layout**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import { siteSettings } from '~/lib/settings';
---

<BaseLayout>
  <section class="mx-auto max-w-6xl px-4 py-20">
    <h1 class="text-5xl font-black uppercase leading-tight md:text-7xl">
      {siteSettings.heroTitle}
    </h1>
    <p class="mt-6 max-w-2xl text-lg text-muted">{siteSettings.heroSubtitle}</p>
  </section>
</BaseLayout>
```

- [ ] **Step 10: Scrivere `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://tedxkigali.rw/sitemap-index.xml
```

- [ ] **Step 11: Verificare build e resa**

```bash
npm test
npm run build
npm run preview
```

Expected: test verdi; build genera `dist/sitemap-index.xml`; nell'anteprima la home mostra header, hero e footer con la dicitura di licenza TEDx, il menu si apre e si chiude su viewport stretto, il tasto Tab mostra "Skip to content".

- [ ] **Step 12: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/layouts src/components src/scripts/nav.ts src/pages/index.astro public/robots.txt
git commit -m "feat: add base layout, header, footer and SEO metadata"
```

---

## Task 7: Card dei talk e player video in overlay

**Files:**
- Create: `src/components/VideoDialog.astro`, `src/components/TalkCard.astro`, `src/scripts/video-dialog.ts`
- Modify: `src/layouts/BaseLayout.astro` (includere `VideoDialog`)

**Interfaces:**
- Consumes: `parseYouTubeId`, `youtubeEmbedUrl`, `youtubeThumbnails` (Task 2); `resolveUploadedImage` (Task 4); collection `talks` (Task 5)
- Produces:
  - `TalkCard` con props `{ talk: CollectionEntry<'talks'>; editionTitle?: string }`
  - contratto DOM: il trigger è un `<button data-youtube-id data-video-title>`; il dialog ha id `#video-dialog` e contenitore `#video-dialog-frame`

- [ ] **Step 1: Scrivere `src/scripts/video-dialog.ts`**

```ts
import { youtubeEmbedUrl } from '~/lib/youtube';

const dialog = document.querySelector<HTMLDialogElement>('#video-dialog');
const frame = document.querySelector<HTMLElement>('#video-dialog-frame');
const heading = document.querySelector<HTMLElement>('#video-dialog-title');

function openVideo(id: string, title: string): void {
  if (!dialog || !frame) return;

  if (heading) heading.textContent = title;

  const iframe = document.createElement('iframe');
  iframe.src = youtubeEmbedUrl(id);
  iframe.title = title;
  iframe.className = 'h-full w-full';
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  frame.replaceChildren(iframe);
  dialog.showModal();
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const trigger = target?.closest<HTMLElement>('[data-youtube-id]');
  if (!trigger) return;

  const id = trigger.dataset.youtubeId;
  if (!id) return;

  event.preventDefault();
  openVideo(id, trigger.dataset.videoTitle ?? 'TEDxKigali talk');
});

// Clicking the backdrop closes the dialog.
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

dialog?.querySelector('[data-close-video]')?.addEventListener('click', () => dialog.close());

// Removing the iframe is what actually stops the audio.
dialog?.addEventListener('close', () => frame?.replaceChildren());
```

- [ ] **Step 2: Scrivere `src/components/VideoDialog.astro`**

```astro
<dialog
  id="video-dialog"
  aria-labelledby="video-dialog-title"
  class="w-[min(96vw,1100px)] rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-black/85"
>
  <div class="flex items-center justify-between gap-4 px-4 py-3">
    <h2 id="video-dialog-title" class="truncate text-sm font-semibold uppercase tracking-wide"></h2>
    <button
      type="button"
      data-close-video
      class="rounded border border-line px-3 py-1 text-sm hover:bg-bg"
      aria-label="Close video"
    >
      Close
    </button>
  </div>
  <div id="video-dialog-frame" class="aspect-video w-full bg-black"></div>
</dialog>

<script>
  import '~/scripts/video-dialog.ts';
</script>
```

- [ ] **Step 3: Includere il dialog nel layout**

In `src/layouts/BaseLayout.astro`, aggiungere l'import in cima al frontmatter:

```astro
import VideoDialog from '~/components/VideoDialog.astro';
```

e inserire il componente subito prima di `<slot name="body-end" />`:

```astro
<VideoDialog />
```

- [ ] **Step 4: Scrivere `src/components/TalkCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import { parseYouTubeId, youtubeThumbnails } from '~/lib/youtube';
import { resolveUploadedImage } from '~/lib/images';

interface Props {
  talk: CollectionEntry<'talks'>;
  editionTitle?: string;
}

const { talk, editionTitle } = Astro.props;
const { title, speaker, youtubeUrl, thumbnail, thumbnailAlt, summary, date, tags } = talk.data;

// The schema already guarantees this parses; the guard keeps TypeScript honest.
const videoId = parseYouTubeId(youtubeUrl);
if (!videoId) throw new Error(`Talk "${talk.id}" has an unusable YouTube link.`);

const thumbs = youtubeThumbnails(videoId);
const uploaded = thumbnail ? resolveUploadedImage(thumbnail) : null;
const year = date.getUTCFullYear();
---

<article
  class="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
  data-talk
  data-year={year}
  data-edition={talk.data.edition?.id ?? ''}
  data-tags={tags.join('|')}
>
  <button
    type="button"
    class="relative block aspect-video w-full overflow-hidden bg-black"
    data-youtube-id={videoId}
    data-video-title={`${title} — ${speaker}`}
  >
    {uploaded ? (
      <Image
        src={uploaded}
        alt={thumbnailAlt ?? ''}
        widths={[400, 800, 1200]}
        sizes="(min-width: 1024px) 400px, 100vw"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    ) : (
      <img
        src={thumbs.primary}
        data-fallback={thumbs.fallback}
        onerror={`this.onerror=null;this.src='${thumbs.fallback}';`}
        alt=""
        width="1280"
        height="720"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    )}

    <span class="absolute inset-0 flex items-center justify-center">
      <span
        class="flex h-16 w-16 items-center justify-center rounded-full bg-ted-red text-ink shadow-lg transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="h-7 w-7 translate-x-[2px] fill-current"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </span>

    <span class="sr-only">Play the talk “{title}” by {speaker}</span>
  </button>

  <div class="flex flex-1 flex-col gap-2 p-4">
    <h3 class="text-lg font-bold leading-snug">{title}</h3>
    <p class="text-sm font-semibold uppercase tracking-wide text-muted">{speaker}</p>
    {summary && <p class="text-sm text-muted">{summary}</p>}
    <p class="mt-auto pt-2 text-xs uppercase tracking-wide text-muted">
      {editionTitle ?? year}
    </p>
  </div>
</article>
```

- [ ] **Step 5: Verificare a mano il comportamento del player**

Aggiungere temporaneamente in `src/pages/index.astro`, dentro `<BaseLayout>` — **questa modifica è solo un banco di prova e non va committata**: viene annullata nello Step 6.5, prima del commit.

```astro
---
import { getCollection } from 'astro:content';
import TalkCard from '~/components/TalkCard.astro';
const talks = await getCollection('talks', ({ data }) => !data.draft);
---
<div class="mx-auto grid max-w-6xl gap-6 px-4 pb-20 md:grid-cols-3">
  {talks.map((talk) => <TalkCard talk={talk} />)}
</div>
```

```bash
npm run dev
```

Verifiche da fare nel browser su `http://localhost:4321`:

1. Nella scheda Network non compare **alcuna** richiesta a `youtube.com` o `youtube-nocookie.com` prima del clic (solo `i.ytimg.com` per le miniature).
2. Al clic sulla card il video si apre in overlay e parte con l'audio.
3. `Esc`, il pulsante Close e il clic sullo sfondo chiudono l'overlay **e l'audio si interrompe**.
4. Con la tastiera: Tab raggiunge il pulsante della card, Invio apre l'overlay, il focus resta dentro l'overlay.
5. Riaprendo una seconda card, nel DOM esiste un solo `<iframe>`.

- [ ] **Step 6: Verificare build e test**

```bash
npm test
npm run build
```

Expected: entrambi verdi.

- [ ] **Step 6.5: Annullare il banco di prova**

```bash
git checkout -- src/pages/index.astro
git diff --stat
```

Expected: `src/pages/index.astro` torna alla versione del Task 6 e non compare fra i file modificati. La griglia temporanea serviva solo a provare il player a mano: la home vera arriva nel Task 11, e committare impalcature usa e getta sporca la storia del repo.

- [ ] **Step 7: Commit**

```bash
git add src/components/VideoDialog.astro src/components/TalkCard.astro src/scripts/video-dialog.ts src/layouts/BaseLayout.astro
git commit -m "feat: play talks in an accessible in-page dialog with a lazy YouTube facade"
```

---

## Task 8: Pagina Talks con filtri

**Files:**
- Create: `src/pages/talks.astro`, `src/scripts/talk-filters.ts`
- Modify: `src/pages/index.astro` (rimuovere la griglia temporanea del Task 7)

**Interfaces:**
- Consumes: `TalkCard` (Task 7); collection `talks` ed `events` (Task 5)
- Produces: contratto DOM `#talk-filters` (contenitore dei bottoni `[data-filter-value]`), `#talks-grid`, `#talks-empty`

- [ ] **Step 1: Scrivere `src/scripts/talk-filters.ts`**

```ts
const filters = document.querySelector<HTMLElement>('#talk-filters');
const grid = document.querySelector<HTMLElement>('#talks-grid');
const empty = document.querySelector<HTMLElement>('#talks-empty');

function apply(value: string): void {
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll<HTMLElement>('[data-talk]').forEach((card) => {
    const matches = value === 'all' || card.dataset.edition === value;
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  if (empty) empty.hidden = visible > 0;
}

filters?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-filter-value]');
  if (!button) return;

  filters.querySelectorAll<HTMLElement>('[data-filter-value]').forEach((other) => {
    other.setAttribute('aria-pressed', String(other === button));
  });

  apply(button.dataset.filterValue ?? 'all');
});
```

- [ ] **Step 2: Scrivere `src/pages/talks.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';
import TalkCard from '~/components/TalkCard.astro';

const talks = (await getCollection('talks', ({ data }) => !data.draft)).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime(),
);

const events = await getCollection('events', ({ data }) => !data.draft);
const editionTitle = new Map(events.map((event) => [event.id, event.data.title]));

const usedEditionIds = [...new Set(talks.map((talk) => talk.data.edition?.id).filter(Boolean))] as string[];
const editions = usedEditionIds
  .map((id) => ({ id, title: editionTitle.get(id) ?? id }))
  .sort((a, b) => b.title.localeCompare(a.title));
---

<BaseLayout
  title="Talks"
  description="Every TEDxKigali talk, ready to watch without leaving the site."
>
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">Talks</h1>
    <p class="mt-4 max-w-2xl text-lg text-muted">
      Ideas from the TEDxKigali stage. Press play — the talk opens right here.
    </p>

    {editions.length > 0 && (
      <div id="talk-filters" class="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter talks by edition">
        <button
          type="button"
          data-filter-value="all"
          aria-pressed="true"
          class="rounded-full border border-line px-4 py-2 text-sm font-semibold uppercase tracking-wide text-muted aria-pressed:border-ted-red aria-pressed:text-ink"
        >
          All
        </button>
        {editions.map((edition) => (
          <button
            type="button"
            data-filter-value={edition.id}
            aria-pressed="false"
            class="rounded-full border border-line px-4 py-2 text-sm font-semibold uppercase tracking-wide text-muted aria-pressed:border-ted-red aria-pressed:text-ink"
          >
            {edition.title}
          </button>
        ))}
      </div>
    )}

    {talks.length === 0 ? (
      <p class="mt-12 text-muted">No talks published yet. Come back after the next event.</p>
    ) : (
      <>
        <div id="talks-grid" class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => (
            <TalkCard talk={talk} editionTitle={talk.data.edition ? editionTitle.get(talk.data.edition.id) : undefined} />
          ))}
        </div>
        <p id="talks-empty" hidden class="mt-10 text-muted">No talks in this edition yet.</p>
      </>
    )}
  </section>

  <!-- Astro bundles this script and injects it as a deferred module, so it
       always runs after the DOM is parsed, wherever it sits in the file. -->
  <script>
    import '~/scripts/talk-filters.ts';
  </script>
</BaseLayout>
```

- [ ] **Step 3: Verificare che la home sia rimasta pulita**

```bash
git diff HEAD --stat -- src/pages/index.astro
```

Expected: nessuna modifica. Il banco di prova del Task 7 è stato annullato prima del commit (Task 7, Step 6.5), quindi `src/pages/index.astro` deve essere ancora la versione hero del Task 6. Se invece contiene una griglia di talk, riportarlo a quella versione. La home definitiva arriva nel Task 11.

- [ ] **Step 4: Verificare a mano**

```bash
npm run dev
```

Su `/talks`:
1. i talk sono ordinati dal più recente al più vecchio;
2. cliccando il filtro di un'edizione restano visibili solo i talk di quell'edizione, e il bottone attivo ha bordo rosso;
3. cliccando "All" tornano tutti;
4. il player funziona come nel Task 7.

- [ ] **Step 5: Verificare build e test**

```bash
npm test
npm run build
```

Expected: verdi, con `dist/talks/index.html` generato.

- [ ] **Step 6: Commit**

```bash
git add src/pages/talks.astro src/scripts/talk-filters.ts src/pages/index.astro
git commit -m "feat: add talks page with edition filters"
```

---

## Task 9: Pagina Events con correzione dello stato nel browser

**Files:**
- Create: `src/content/events/tedxkigali-2024.md`, `src/content/talks/2024-09-21-the-market-at-dawn.md`, `src/components/EventCard.astro`, `src/pages/events/index.astro`, `src/scripts/event-status.ts`

**Interfaces:**
- Consumes: `eventState`, `eventEnd`, `isBookable`, `ticketStatusLabel` (Task 3); `resolveUploadedImage` (Task 4); collection `events` (Task 5)
- Produces:
  - `EventCard` con props `{ event: CollectionEntry<'events'>; now?: Date }`
  - contratto DOM: `article[data-event]` con `data-event-start`, `data-event-end`, `data-ticket-status`; contenitori `#events-upcoming`, `#events-past`; sezioni `#events-upcoming-section`, `#events-past-section`; il pulsante di prenotazione ha `data-booking`

- [ ] **Step 0: Arricchire i contenuti di esempio**

I due talk di esempio appartengono alla stessa edizione e hanno la stessa data, quindi né l'ordinamento né il filtro per edizione né l'archivio delle edizioni passate sono esercitati da dati reali. Una terza edizione risolve tutti e tre.

`src/content/events/tedxkigali-2024.md`:

```markdown
---
title: "TEDxKigali 2024 — Threads"
startDate: 2024-09-21T09:00:00+02:00
endDate: 2024-09-21T17:00:00+02:00
venue: "Kigali Convention Centre"
theme: "Threads"
summary: "Eight speakers on the invisible threads that connect a city to its people."
ticketStatus: "closed"
---

The 2024 edition followed the theme **Threads**: the connections that hold a
growing city together.
```

`src/content/talks/2024-09-21-the-market-at-dawn.md`:

```markdown
---
title: "The market at dawn"
speaker: "Claudine Mukamana"
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
date: 2024-09-21
edition: "tedxkigali-2024"
summary: "What Kimironko market at five in the morning reveals about how cities really work."
tags: ["public speaking", "community"]
---
```

> Il tag `public speaking` contiene volutamente uno spazio: è la prova permanente che la serializzazione dei tag regge un contenuto legittimo che una redazione scriverebbe davvero. Con il vecchio delimitatore a spazio quel talk sarebbe sparito dai propri filtri.

- [ ] **Step 1: Scrivere `src/scripts/event-status.ts`**

```ts
// The site is static: an event could otherwise stay "upcoming" until the next
// build. This re-checks every card against the visitor's clock on page load.
//
// The duration is imported, never re-declared: the build stamps data-event-end
// with it and this script falls back to it, so two copies drifting apart would
// make the page disagree with itself about when an event ends.
import { DEFAULT_EVENT_DURATION_MS } from '~/lib/events';

const upcoming = document.querySelector<HTMLElement>('#events-upcoming');
const past = document.querySelector<HTMLElement>('#events-past');

function endOf(card: HTMLElement, start: number): number {
  const raw = card.dataset.eventEnd;
  const end = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(end) && end > start ? end : start + DEFAULT_EVENT_DURATION_MS;
}

function refresh(): void {
  const now = Date.now();

  document.querySelectorAll<HTMLElement>('article[data-event]').forEach((card) => {
    const start = Date.parse(card.dataset.eventStart ?? '');
    if (!Number.isFinite(start)) return;

    const state = now < start ? 'upcoming' : now <= endOf(card, start) ? 'live' : 'past';
    card.dataset.eventState = state;

    const badge = card.querySelector<HTMLElement>('[data-live-badge]');
    if (badge) badge.hidden = state !== 'live';

    const booking = card.querySelector<HTMLAnchorElement>('[data-booking]');
    if (booking && state === 'past') booking.remove();

    if (state === 'past' && past && card.parentElement !== past) past.prepend(card);
    if (state !== 'past' && upcoming && card.parentElement !== upcoming) upcoming.append(card);
  });

  // Any page can host event cards outside the events index — the home page's
  // "Next event" block does. Such a section hides itself once every card in it
  // has passed, so the home never announces a finished event as the next one.
  document.querySelectorAll<HTMLElement>('[data-event-section]').forEach((section) => {
    const live = section.querySelectorAll('article[data-event]:not([data-event-state="past"])');
    section.hidden = live.length === 0;
  });

  toggleSection('#events-upcoming-section', upcoming);
  toggleSection('#events-past-section', past);

  // The empty-state paragraph is the inverse of the upcoming section: if every
  // event turned out to be over, the page must say so rather than showing
  // nothing but the archive.
  const none = document.querySelector<HTMLElement>('#events-none');
  if (none && upcoming) none.hidden = upcoming.children.length > 0;
}

function toggleSection(selector: string, list: HTMLElement | null): void {
  const section = document.querySelector<HTMLElement>(selector);
  if (section && list) section.hidden = list.children.length === 0;
}

refresh();
```

- [ ] **Step 2: Scrivere `src/components/EventCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import { eventEnd, eventState, isBookable, ticketStatusLabel } from '~/lib/events';
import { resolveUploadedImage } from '~/lib/images';

interface Props {
  event: CollectionEntry<'events'>;
  now?: Date;
}

const { event, now = new Date() } = Astro.props;
const data = event.data;
const ticketStatus = data.ticketStatus;

const state = eventState(data.startDate, data.endDate, now);
const bookable = isBookable(state, ticketStatus) && !!data.bookingUrl;
const image = data.image ? resolveUploadedImage(data.image) : null;

const dateLabel = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Kigali',
}).format(data.startDate);
---

<article
  class="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
  data-event
  data-event-state={state}
  data-event-start={data.startDate.toISOString()}
  data-event-end={eventEnd(data.startDate, data.endDate).toISOString()}
  data-ticket-status={ticketStatus}
>
  {image && (
    <Image
      src={image}
      alt={data.imageAlt ?? ''}
      widths={[400, 800, 1200]}
      sizes="(min-width: 1024px) 500px, 100vw"
      class="aspect-video w-full object-cover"
    />
  )}

  <div class="flex flex-1 flex-col gap-3 p-5">
    <p data-live-badge hidden class="w-fit rounded bg-ted-red px-2 py-1 text-xs font-bold uppercase text-ink">
      Happening now
    </p>

    <h3 class="text-2xl font-bold leading-tight">
      <a class="hover:underline" href={`/events/${event.id}`}>{data.title}</a>
    </h3>

    <p class="text-sm uppercase tracking-wide text-muted">
      <time datetime={data.startDate.toISOString()}>{dateLabel}</time> · {data.venue}
    </p>

    <p class="text-sm text-muted">{data.summary}</p>

    <p class="text-sm font-semibold">{ticketStatusLabel(ticketStatus)}</p>

    <div class="mt-auto flex flex-wrap gap-3 pt-2">
      {bookable && (
        <a
          data-booking
          href={data.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded bg-ted-red px-5 py-3 text-sm font-bold uppercase tracking-wide text-ink hover:bg-ted-red/90"
        >
          {data.bookingLabel}
        </a>
      )}
      <a
        href={`/events/${event.id}`}
        class="rounded border border-line px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-bg"
      >
        Event details
      </a>
    </div>
  </div>
</article>
```

- [ ] **Step 3: Scrivere `src/pages/events/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';
import EventCard from '~/components/EventCard.astro';
import { eventState } from '~/lib/events';

const now = new Date();
const events = await getCollection('events', ({ data }) => !data.draft);

const upcoming = events
  .filter((event) => eventState(event.data.startDate, event.data.endDate, now) !== 'past')
  .sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());

const past = events
  .filter((event) => eventState(event.data.startDate, event.data.endDate, now) === 'past')
  .sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime());
---

<BaseLayout title="Events" description="Upcoming TEDxKigali events and the archive of past editions.">
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">Events</h1>

    <div id="events-upcoming-section" class="mt-12" hidden={upcoming.length === 0}>
      <h2 class="text-2xl font-bold uppercase tracking-wide">Upcoming</h2>
      <div id="events-upcoming" class="mt-6 grid gap-6 md:grid-cols-2">
        {upcoming.map((event) => <EventCard event={event} now={now} />)}
      </div>
    </div>

    <p id="events-none" class="mt-12 text-muted" hidden={upcoming.length > 0}>
      No event is scheduled right now. Follow us on social media to hear about the next one first.
    </p>

    <div id="events-past-section" class="mt-16" hidden={past.length === 0}>
      <h2 class="text-2xl font-bold uppercase tracking-wide">Past editions</h2>
      <div id="events-past" class="mt-6 grid gap-6 md:grid-cols-2">
        {past.map((event) => <EventCard event={event} now={now} />)}
      </div>
    </div>
  </section>

  <script>
    import '~/scripts/event-status.ts';
  </script>
</BaseLayout>
```

- [ ] **Step 4: Verificare a mano la correzione dello stato**

```bash
npm run dev
```

1. Su `/events` l'edizione 2026 compare in "Upcoming" con il pulsante di prenotazione, la 2025 in "Past editions".
2. Nei DevTools, con il pannello Sensors o modificando temporaneamente l'orologio di sistema a una data successiva al 15/11/2026, ricaricare: l'evento 2026 deve spostarsi in "Past editions" e il pulsante di prenotazione deve sparire, **senza ricostruire il sito**.
3. Ripristinare l'orologio.

- [ ] **Step 5: Verificare build e test**

```bash
npm test
npm run build
```

Expected: verdi, con `dist/events/index.html` generato.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventCard.astro src/pages/events/index.astro src/scripts/event-status.ts
git commit -m "feat: list events and re-check their state in the browser"
```

---

## Task 10: Pagina del singolo evento con dati strutturati

**Files:**
- Create: `src/components/EventJsonLd.astro`, `src/pages/events/[slug].astro`

**Interfaces:**
- Consumes: `eventEnd`, `eventState`, `isBookable`, `ticketStatusLabel` (Task 3); `resolveUploadedImage` (Task 4); `TalkCard` (Task 7); collection `events`, `talks` (Task 5)
- Produces: `EventJsonLd` con props `{ event: CollectionEntry<'events'>; state: EventState; organiserUrl: string }`

- [ ] **Step 1: Scrivere `src/components/EventJsonLd.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { eventEnd, type EventState } from '~/lib/events';
import { toJsonLd } from '~/lib/seo';
import { siteSettings } from '~/lib/settings';

interface Props {
  event: CollectionEntry<'events'>;
  state: EventState;
  organiserUrl: string;
}

const { event, state, organiserUrl } = Astro.props;
const data = event.data;
const status = data.ticketStatus;

// An offer is emitted only when the page itself still offers a way to book, so
// the structured data cannot advertise tickets the page has already withdrawn.
// The case that matters: an editor closes registrations but leaves the old
// booking link in the field — the button disappears, and Google must not be
// told the tickets are still on sale there.
const offerable =
  state !== 'past' && (status === 'open' || status === 'free' || status === 'sold-out');
const showOffer = offerable && !!data.bookingUrl;

const availability =
  status === 'sold-out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: data.title,
  description: data.summary,
  startDate: data.startDate.toISOString(),
  endDate: eventEnd(data.startDate, data.endDate).toISOString(),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: data.venue,
    address: data.address ?? 'Kigali, Rwanda',
  },
  organizer: { '@type': 'Organization', name: siteSettings.siteName, url: organiserUrl },
  ...(showOffer
    ? {
        offers: {
          '@type': 'Offer',
          url: data.bookingUrl,
          availability,
          // price and priceCurrency are deliberately omitted for paid events.
          // Google treats them as recommended, not required: the rich result
          // still shows the date and the ticket link. The price itself lives on
          // the external ticketing platform, and a copy kept here would sooner
          // or later be stale — a wrong price in Google's results is worse than
          // no price at all. A free event is the one case we can state safely.
          ...(status === 'free' ? { price: '0', priceCurrency: 'RWF' } : {}),
        },
      }
    : {}),
};
---

<script type="application/ld+json" is:inline set:html={toJsonLd(jsonLd)}></script>
```

- [ ] **Step 2: Scrivere `src/pages/events/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '~/layouts/BaseLayout.astro';
import EventJsonLd from '~/components/EventJsonLd.astro';
import TalkCard from '~/components/TalkCard.astro';
import { eventState, isBookable, ticketStatusLabel } from '~/lib/events';
import { resolveUploadedImage } from '~/lib/images';
import { canonicalUrl } from '~/lib/seo';

export async function getStaticPaths() {
  const events = await getCollection('events', ({ data }) => !data.draft);
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}

const { event } = Astro.props;
const data = event.data;
const ticketStatus = data.ticketStatus;

const now = new Date();
const state = eventState(data.startDate, data.endDate, now);
const bookable = isBookable(state, ticketStatus) && !!data.bookingUrl;
const image = data.image ? resolveUploadedImage(data.image) : null;

// Absolute url, required by social networks for the preview image.
const ogImage = image && Astro.site ? new URL(image.src, Astro.site).toString() : undefined;

const dateLabel = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Kigali',
}).format(data.startDate);

const { Content } = await render(event);

const talks = (await getCollection('talks', ({ data: talk }) => !talk.draft && talk.edition?.id === event.id)).sort(
  (a, b) => a.data.title.localeCompare(b.data.title),
);

// The organiser is TEDxKigali itself, not this page: schema.org expects an
// Organization.url that identifies the organisation.
const organiserUrl = Astro.site?.toString() ?? canonicalUrl(Astro.url.pathname, Astro.site);
---

<BaseLayout title={data.title} description={data.summary} image={ogImage}>
  <EventJsonLd slot="head" event={event} state={state} organiserUrl={organiserUrl} />

  <article class="mx-auto max-w-4xl px-4 py-16">
    {data.theme && <p class="text-sm font-bold uppercase tracking-widest text-muted">{data.theme}</p>}
    <h1 class="mt-2 text-4xl font-black uppercase leading-tight md:text-6xl">{data.title}</h1>

    <p class="mt-6 text-lg">
      <time datetime={data.startDate.toISOString()}>{dateLabel}</time>
    </p>
    <p class="text-lg text-muted">
      {data.venue}{data.address ? ` — ${data.address}` : ''}
      {data.mapUrl && (
        <>
          {' '}
          <a class="underline hover:no-underline" href={data.mapUrl} target="_blank" rel="noopener noreferrer">
            View map
          </a>
        </>
      )}
    </p>

    {image && (
      <Image
        src={image}
        alt={data.imageAlt ?? ''}
        widths={[600, 1000, 1600]}
        sizes="(min-width: 1024px) 900px, 100vw"
        class="mt-8 w-full rounded-lg object-cover"
      />
    )}

    <div class="mt-8 rounded-lg border border-line bg-surface p-6">
      <p class="text-sm font-semibold uppercase tracking-wide">{ticketStatusLabel(ticketStatus)}</p>
      {bookable && (
        <a
          data-booking
          href={data.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 inline-block rounded bg-ted-red px-6 py-3 font-bold uppercase tracking-wide text-ink hover:bg-ted-red/90"
        >
          {data.bookingLabel}
        </a>
      )}
      <p class="mt-3 text-xs text-muted">Booking is handled on an external ticketing website.</p>
    </div>

    <div class="prose prose-invert mt-10 max-w-none">
      <Content />
    </div>

    {talks.length > 0 && (
      <section class="mt-16">
        <h2 class="text-2xl font-bold uppercase tracking-wide">Talks from this edition</h2>
        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          {talks.map((talk) => <TalkCard talk={talk} editionTitle={data.title} />)}
        </div>
      </section>
    )}
  </article>
</BaseLayout>
```

- [ ] **Step 3: Installare il plugin tipografico usato dalla pagina**

```bash
npm install -D @tailwindcss/typography
```

In `src/styles/global.css`, subito dopo `@import "tailwindcss";`, aggiungere:

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Verificare a mano**

```bash
npm run dev
```

1. `/events/tedxkigali-2026` mostra data, sede, pulsante di prenotazione e corpo Markdown.
2. `/events/tedxkigali-2025` elenca i due talk di esempio, riproducibili in overlay.
3. Nel sorgente della pagina c'è un blocco `application/ld+json` con `"@type": "Event"` e `offers.url` uguale al link di prenotazione.

- [ ] **Step 5: Verificare build e test**

```bash
npm test
npm run build
```

Expected: verdi, con `dist/events/tedxkigali-2026/index.html` e `dist/events/tedxkigali-2025/index.html` generati.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventJsonLd.astro src/pages/events/\[slug\].astro src/styles/global.css package.json package-lock.json
git commit -m "feat: add event detail pages with Event structured data"
```

---

## Task 11: Home page

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `TalkCard` (Task 7), `EventCard` (Task 9), `eventState` (Task 3), `siteSettings` (Task 5)
- Produces: niente per i task successivi

- [ ] **Step 1: Scrivere `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';
import TalkCard from '~/components/TalkCard.astro';
import EventCard from '~/components/EventCard.astro';
import { eventState } from '~/lib/events';
import { siteSettings } from '~/lib/settings';

const now = new Date();

const events = await getCollection('events', ({ data }) => !data.draft);
const nextEvent = events
  .filter((event) => eventState(event.data.startDate, event.data.endDate, now) !== 'past')
  .sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime())[0];

const allTalks = (await getCollection('talks', ({ data }) => !data.draft)).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime(),
);
const featured = allTalks.filter((talk) => talk.data.featured);
const highlighted = (featured.length > 0 ? featured : allTalks).slice(0, 6);
---

<BaseLayout>
  <section class="mx-auto max-w-6xl px-4 py-20 md:py-28">
    <p class="text-sm font-bold uppercase tracking-widest text-muted">Kigali, Rwanda</p>
    <h1 class="mt-4 text-5xl font-black uppercase leading-[0.95] md:text-8xl">
      {siteSettings.heroTitle}
    </h1>
    <p class="mt-8 max-w-2xl text-lg text-muted md:text-xl">{siteSettings.heroSubtitle}</p>

    <div class="mt-10 flex flex-wrap gap-4">
      <a
        href="/talks"
        class="rounded bg-ted-red px-6 py-3 font-bold uppercase tracking-wide text-ink hover:bg-ted-red/90"
      >
        Watch the talks
      </a>
      <a
        href="/events"
        class="rounded border border-line px-6 py-3 font-bold uppercase tracking-wide hover:bg-surface"
      >
        See the events
      </a>
    </div>
  </section>

  {nextEvent && (
    <section data-event-section class="mx-auto max-w-6xl px-4 pb-16">
      <h2 class="text-2xl font-bold uppercase tracking-wide">Next event</h2>
      <div class="mt-6 grid gap-6 md:grid-cols-2">
        <EventCard event={nextEvent} now={now} />
      </div>
    </section>
  )}

  {highlighted.length > 0 && (
    <section class="mx-auto max-w-6xl px-4 pb-16">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-2xl font-bold uppercase tracking-wide">Talks to start with</h2>
        <a class="text-sm underline hover:no-underline" href="/talks">All talks</a>
      </div>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlighted.map((talk) => <TalkCard talk={talk} />)}
      </div>
    </section>
  )}

  <section class="mx-auto max-w-6xl px-4 pb-24">
    <div class="rounded-lg border border-line bg-surface p-8">
      <h2 class="text-2xl font-bold uppercase tracking-wide">About TEDxKigali</h2>
      <p class="mt-4 max-w-3xl text-lg text-muted">{siteSettings.aboutShort}</p>
      <a class="mt-6 inline-block text-sm underline hover:no-underline" href="/about">Read more</a>
    </div>
  </section>

  <!-- The home page carries an event card, so it needs the same runtime date
       check as the events page: without it a stale build would keep offering a
       finished event as the next one, booking button and all. -->
  <script>
    import '~/scripts/event-status.ts';
  </script>
</BaseLayout>
```

- [ ] **Step 2: Verificare a mano**

```bash
npm run dev
```

Sulla home: hero, il prossimo evento con pulsante di prenotazione, sei talk in evidenza riproducibili in overlay, blocco About. Su viewport da telefono tutto resta su una colonna senza scroll orizzontale.

- [ ] **Step 3: Verificare build e test**

```bash
npm test
npm run build
```

Expected: verdi.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build the home page around the next event and featured talks"
```

---

## Task 12: About, Privacy e 404

**Files:**
- Create: `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/404.astro`

**Interfaces:**
- Consumes: `siteSettings` (Task 5), `BaseLayout` (Task 6)
- Produces: niente per i task successivi

- [ ] **Step 1: Scrivere `src/pages/about.astro`**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import { siteSettings } from '~/lib/settings';
---

<BaseLayout title="About" description="What TEDxKigali is and how to take part.">
  <section class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">About</h1>

    <div class="prose prose-invert mt-8 max-w-none">
      <p class="lead">{siteSettings.aboutShort}</p>

      <h2>What is TEDx?</h2>
      <p>
        In the spirit of ideas worth spreading, TED has created a programme of local,
        self-organised events called TEDx. At a TEDx event, TED Talks video and live
        speakers combine to spark deep discussion and connection. {siteSettings.tedxXExplanation}.
      </p>

      <h2>TEDxKigali</h2>
      <p>
        TEDxKigali gathers speakers from across Rwanda — researchers, entrepreneurs, artists,
        teachers and activists — and gives them a stage to share the idea they care about most.
        Every talk is recorded and published here, free to watch.
      </p>

      <h2>Take part</h2>
      <p>
        We are always looking for speakers, volunteers and partners. Write to us at
        <a href={`mailto:${siteSettings.contactEmail}`}>{siteSettings.contactEmail}</a> and tell us
        which idea you would bring to the stage.
      </p>
    </div>
  </section>
</BaseLayout>
```

> Il testo storico e i nomi del team vengono forniti dal team di Kigali nel Task 18 e sostituiscono i due paragrafi centrali.

- [ ] **Step 2: Scrivere `src/pages/privacy.astro`**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import { siteSettings } from '~/lib/settings';
---

<BaseLayout title="Privacy" description="How this website handles your data.">
  <section class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">Privacy</h1>

    <div class="prose prose-invert mt-8 max-w-none">
      <h2>The short version</h2>
      <p>
        This website sets no cookies of its own, runs no analytics and has no user accounts.
        We build no profiles of visitors, and we never sell or share data for advertising.
      </p>
      <p>
        Two things are worth knowing all the same: the servers that host this site keep
        standard logs that include IP addresses, and choosing to play a talk hands your
        request to YouTube. Both are explained below.
      </p>

      <h2>Videos</h2>
      <p>
        Talks are hosted on YouTube. Until you press play, your browser only loads the
        preview image from <code>i.ytimg.com</code>. When you press play, the video is loaded
        from <code>youtube-nocookie.com</code> and, from that moment, YouTube (Google) may
        store data on your device and process your IP address under its own privacy policy.
        Pressing play is your choice, and it is the only way this site contacts YouTube.
      </p>

      <h2>Booking tickets</h2>
      <p>
        Tickets are sold by an external ticketing platform. A booking link opens that platform
        in a new tab, and from there on the data you enter is handled by that platform under its
        own terms.
      </p>

      <h2>Hosting and logs</h2>
      <p>
        The site is served as static files by our hosting provider, which keeps standard server
        logs (including IP addresses) for security and reliability purposes.
      </p>

      <h2>Your rights</h2>
      <p>
        We follow Rwanda's Law No. 058/2021 on the protection of personal data and privacy.
        For any question about this page, write to
        <a href={`mailto:${siteSettings.contactEmail}`}>{siteSettings.contactEmail}</a>.
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Scrivere `src/pages/404.astro`**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
---

<BaseLayout title="Page not found" noIndex={true}>
  <section class="mx-auto max-w-3xl px-4 py-24 text-center">
    <p class="text-6xl font-black text-ted-red">404</p>
    <h1 class="mt-4 text-3xl font-black uppercase md:text-5xl">This page does not exist</h1>
    <p class="mt-4 text-lg text-muted">It may have moved, or the link may be wrong.</p>

    <div class="mt-10 flex flex-wrap justify-center gap-4">
      <a href="/talks" class="rounded bg-ted-red px-6 py-3 font-bold uppercase tracking-wide text-ink">
        Watch the talks
      </a>
      <a href="/events" class="rounded border border-line px-6 py-3 font-bold uppercase tracking-wide">
        See the events
      </a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Verificare build e resa**

```bash
npm run build
npm run preview
```

Verificare `/about`, `/privacy` e un URL inesistente come `/nope` (deve mostrare la 404 con `<meta name="robots" content="noindex">` nel sorgente).

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro src/pages/privacy.astro src/pages/404.astro
git commit -m "feat: add about, privacy and 404 pages"
```

---

## Task 13: Configurazione del CMS

**Files:**
- Create: `.pages.yml`

**Interfaces:**
- Consumes: la struttura di `src/content/` e i nomi dei campi definiti nel Task 5
- Produces: i form che vedrà la redazione. **Ogni campo `name` deve corrispondere esattamente al nome usato negli schemi Zod**: un disallineamento fa fallire il build.

- [ ] **Step 1: Scrivere `.pages.yml`**

```yaml
media:
  input: src/assets/uploads
  output: src/assets/uploads
  extensions: [jpg, jpeg, png, webp, svg]

content:
  - name: events
    label: Events
    type: collection
    path: src/content/events
    filename: '{fields.title}.md'
    view:
      fields: [title, startDate, ticketStatus]
      sort: [startDate, title]
      default:
        sort: startDate
        order: desc
    fields:
      - { name: title, label: Event title, type: string, required: true, description: 'For example: TEDxKigali 2026 — Rising' }
      - { name: startDate, label: Start date and time, type: date, options: { format: "yyyy-MM-dd'T'HH:mm:ssxxx", time: true }, required: true, description: 'Enter the time as it will show on a clock in Kigali. If you are editing from outside Rwanda, check the saved value ends in +02:00.' }
      - { name: endDate, label: End date and time, type: date, options: { format: "yyyy-MM-dd'T'HH:mm:ssxxx", time: true }, description: 'Optional. If empty, the event is assumed to last four hours.' }
      - { name: venue, label: Venue, type: string, required: true }
      - { name: address, label: Address, type: string }
      - { name: mapUrl, label: Map link, type: string, description: 'Optional link to Google Maps.' }
      - { name: image, label: Event image, type: image }
      - { name: imageAlt, label: Image description, type: string, description: 'Required if you upload an image. Describe it for people using a screen reader.' }
      - { name: theme, label: Edition theme, type: string, description: 'One or two words, for example: Rising.' }
      - { name: summary, label: Short summary, type: text, required: true, description: 'Max 300 characters. Shown in listings and when the page is shared.' }
      - name: ticketStatus
        label: Ticket status
        type: select
        required: true
        options:
          values:
            - { value: coming-soon, label: Tickets coming soon }
            - { value: open, label: Tickets on sale }
            - { value: free, label: 'Free entry — registration required' }
            - { value: sold-out, label: Sold out }
            - { value: closed, label: Registrations closed }
      - { name: bookingUrl, label: Booking link, type: string, description: 'Paste the link from your ticketing platform. Required when tickets are on sale or entry is free.' }
      - { name: bookingLabel, label: Booking button text, type: string, default: 'Book your seat' }
      - { name: draft, label: Hide from the website, type: boolean, default: false }
      - { name: body, label: Full description, type: rich-text }

  - name: talks
    label: Talks
    type: collection
    path: src/content/talks
    filename: '{fields.title}.md'
    view:
      fields: [title, speaker, date]
      default:
        sort: date
        order: desc
    fields:
      - { name: title, label: Talk title, type: string, required: true }
      - { name: speaker, label: Speaker name, type: string, required: true }
      - { name: youtubeUrl, label: YouTube link, type: string, required: true, description: 'Open the talk on YouTube and copy the link from the address bar.' }
      - { name: date, label: Talk date, type: date, options: { format: 'yyyy-MM-dd' }, required: true }
      - name: edition
        label: Event edition
        type: reference
        description: 'Which TEDxKigali edition was this talk filmed at? Pick it from the list. Create the event first if it is not there yet.'
        options:
          collection: events
          value: '{name}'
          label: '{fields.title}'
      - { name: summary, label: Short summary, type: text, description: 'Max 300 characters.' }
      - { name: thumbnail, label: Cover image, type: image, description: 'Optional. Leave empty to use the YouTube preview image.' }
      - { name: thumbnailAlt, label: Cover image description, type: string, description: 'Required if you upload a cover image.' }
      - { name: featured, label: Show on the home page, type: boolean, default: false }
      - { name: tags, label: Tags, type: string, list: true, description: 'Optional keywords used to filter the talks page, for example: community, climate, public speaking.' }
      - { name: draft, label: Hide from the website, type: boolean, default: false }

  - name: settings
    label: Site texts
    type: file
    path: src/content/settings/site.json
    fields:
      - { name: siteName, label: Site name, type: string, required: true }
      - { name: tagline, label: Tagline, type: string, required: true }
      - { name: heroTitle, label: Home page headline, type: string, required: true }
      - { name: heroSubtitle, label: Home page intro, type: text, required: true }
      - { name: aboutShort, label: Short about text, type: text, required: true }
      - { name: contactEmail, label: Contact email, type: string, required: true }
      - name: socials
        label: Social links
        type: object
        list: true
        fields:
          - { name: label, label: Name, type: string, required: true }
          - { name: url, label: Link, type: string, required: true }
      - { name: seoDescription, label: Search engine description, type: text, required: true }
      - { name: tedxLicenceNotice, label: TED licence notice, type: string, required: true, description: 'Required by TED. Change only if TED updates the required wording.' }
      - { name: tedxXExplanation, label: Meaning of the x, type: string, required: true }
```

- [ ] **Step 2: Verificare che YAML e nomi dei campi siano coerenti con gli schemi**

Controllare uno per uno che ogni `name` in `.pages.yml` esista con la stessa grafia in `src/content.config.ts` (collection `talks` ed `events`) e in `src/lib/settings.ts` (`siteSettingsSchema`). Correggere `.pages.yml` in caso di differenze — mai gli schemi, che sono la fonte di verità.

- [ ] **Step 3: Verificare il file nell'interfaccia del CMS**

Questa verifica richiede il repository su GitHub e va quindi ripetuta nel Task 18; eseguirla qui se il repository remoto esiste già.

1. Aprire `https://app.pagescms.org`, accedere con GitHub e installare l'app sul repository.
2. Aprire il progetto e controllare che compaiano le tre voci **Events**, **Talks**, **Site texts**.
3. Aprire un evento esistente: tutti i campi devono essere popolati e le etichette leggibili.
4. Controllare in particolare il campo **Event edition** dentro Talks: deve mostrare l'elenco delle edizioni. Se il selettore risultasse vuoto o malformato, allineare la sintassi del campo `reference` alla documentazione corrente su `pagescms.org/docs` e ripetere la verifica.
5. Creare un talk di prova, salvarlo, verificare il commit su GitHub, poi cancellarlo dal CMS.

- [ ] **Step 4: Commit**

```bash
git add .pages.yml
git commit -m "feat: configure Pages CMS forms for events, talks and site texts"
```

---

## Task 14: Integrazione continua e guida per la redazione

**Files:**
- Create: `.github/workflows/ci.yml`, `docs/EDITING.md`

**Interfaces:**
- Consumes: script npm `test` e `build` (Task 1)
- Produces: niente per i task successivi

- [ ] **Step 1: Scrivere `.github/workflows/ci.yml`**

```yaml
name: CI

# Triggered by events, never on a schedule: GitHub disables scheduled
# workflows after 60 days of repository inactivity, which is normal between
# two TEDx editions.
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Scrivere `docs/EDITING.md`**

````markdown
# Updating the TEDxKigali website

You do not need to write code to update this website. Everything is done through
a form-based editor called **Pages CMS**.

## 1. Signing in

1. Go to <https://app.pagescms.org>.
2. Click **Sign in with GitHub** and use the GitHub account you were given access with.
3. Open the **tedxkigali** project.

You will see three sections: **Events**, **Talks** and **Site texts**.

## 2. Adding a talk

1. Open **Talks** and click **Add an entry**.
2. Fill in:
   - **Talk title** — exactly as it appears on stage.
   - **Speaker name**.
   - **YouTube link** — open the talk on YouTube, copy the link from your browser's
     address bar and paste it here. Any YouTube link works.
   - **Talk date**.
   - **Event edition** — pick the edition the talk belongs to.
   - **Short summary** — one or two sentences, max 300 characters.
   - **Show on the home page** — turn on for the three or four talks you want to
     highlight first.
3. Leave **Cover image** empty unless you want a custom cover: by default the site
   uses YouTube's own preview image.
4. Click **Save**.

The talk appears on the website about one minute later.

## 3. Adding an event

1. Open **Events** and click **Add an entry**.
2. Fill in title, start date and time (Kigali time), venue and short summary.
3. Choose the **Ticket status**:
   - *Tickets coming soon* — the event is announced, no booking button yet.
   - *Tickets on sale* / *Free entry* — a booking button appears. **A booking link
     is required.**
   - *Sold out* / *Registrations closed* — no booking button.
4. Paste the **Booking link** from your ticketing platform (Eventbrite, a Google
   Form, or anything else). It opens in a new tab.
5. Click **Save**.

The event moves from *Upcoming* to *Past editions* by itself once it is over. You
do not need to do anything.

## 4. Adding a speaker or a partner

Same steps, under **Speakers** and **Partners**. Every uploaded photo or logo needs
a short **description** — it is read aloud to visitors who use a screen reader.

## 5. Changing the home page or About text

Open **Site texts**. These fields appear across the whole website, so read them
twice before saving.

## 6. What happens after you press Save

1. Your change is saved to GitHub.
2. The website is rebuilt automatically.
3. About one minute later the change is live. Refresh the page to see it.

## 7. If something goes wrong

If a required field is missing or a link is wrong, the rebuild stops and **the
website keeps showing the previous version** — visitors never see a broken page.
You will receive an email saying the build failed.

What to do:

1. Read the message in the email: it names the file and explains the problem in
   plain English (for example *"YouTube link not recognised"*).
2. Go back into the CMS, open that entry, fix the field, and save again.
3. If you cannot work out what is wrong, contact the site maintainer with a
   screenshot of the email.

## 8. Images

Upload photos that are at most about 2000 pixels wide. The website resizes and
compresses them automatically, but starting from a smaller file keeps the site
fast for visitors on mobile data.
````

- [ ] **Step 3: Verificare che la CI passi in locale**

```bash
npm ci
npm test
npm run build
```

Expected: gli stessi tre comandi del workflow completano senza errori.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml docs/EDITING.md
git commit -m "chore: add CI workflow and editor documentation"
```

---

## Task 15: Speaker (Fase 2)

**Files:**
- Create: `src/content/speakers/aline-uwase.md`, `src/components/SpeakerCard.astro`, `src/pages/speakers.astro`
- Modify: `src/content.config.ts`, `.pages.yml`

**Interfaces:**
- Consumes: `resolveUploadedImage` (Task 4), collection `talks` (Task 5)
- Produces: collection `speakers`; `SpeakerCard` con props `{ speaker: CollectionEntry<'speakers'>; talkHref?: string }`

- [ ] **Step 1: Aggiungere la collection `speakers` in `src/content.config.ts`**

Aggiungere prima dell'export:

```ts
const speakers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speakers' }),
  schema: z
    .object({
      name: z.string().min(1),
      role: z.string().optional(),
      photo: uploadPath.optional(),
      photoAlt: z.string().optional(),
      talk: reference('talks').optional(),
      links: z
        .array(z.object({ label: z.string().min(1), url: z.url() }))
        .default([]),
      order: z.number().int().optional(),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.photo || (data.photoAlt ?? '').trim() !== '', {
      message: 'Describe the photo in "Photo description" so screen readers can read it.',
      path: ['photoAlt'],
    }),
});
```

e cambiare l'export in:

```ts
export const collections = { talks, events, speakers };
```

- [ ] **Step 2: Creare `src/content/speakers/aline-uwase.md`**

```markdown
---
name: "Aline Uwase"
role: "Environmental researcher, University of Rwanda"
talk: "2025-10-18-the-hills-that-listen"
links:
  - { label: "LinkedIn", url: "https://www.linkedin.com/in/example" }
order: 1
---

Aline studies how Rwanda's landscape shapes the way communities talk to each other,
and works with local councils to turn that research into public policy.
```

- [ ] **Step 3: Scrivere `src/components/SpeakerCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import { resolveUploadedImage } from '~/lib/images';

interface Props {
  speaker: CollectionEntry<'speakers'>;
  talkHref?: string;
}

const { speaker, talkHref } = Astro.props;
const { name, role, photo, photoAlt, links } = speaker.data;
const image = photo ? resolveUploadedImage(photo) : null;
---

<article class="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
  {image ? (
    <Image
      src={image}
      alt={photoAlt ?? ''}
      widths={[200, 400]}
      sizes="200px"
      class="h-32 w-32 rounded-full object-cover"
    />
  ) : (
    <div class="flex h-32 w-32 items-center justify-center rounded-full bg-bg text-3xl font-black text-muted" aria-hidden="true">
      {name.charAt(0)}
    </div>
  )}

  <h3 class="text-xl font-bold">{name}</h3>
  {role && <p class="text-sm uppercase tracking-wide text-muted">{role}</p>}

  <div class="prose prose-invert prose-sm max-w-none">
    <slot />
  </div>

  <div class="mt-auto flex flex-wrap gap-4 pt-2 text-sm">
    {talkHref && <a class="underline hover:no-underline" href={talkHref}>Watch the talk</a>}
    {links.map((link) => (
      <a class="underline hover:no-underline" href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    ))}
  </div>
</article>
```

- [ ] **Step 4: Scrivere `src/pages/speakers.astro`**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import BaseLayout from '~/layouts/BaseLayout.astro';
import SpeakerCard from '~/components/SpeakerCard.astro';

const speakers = (await getCollection('speakers', ({ data }) => !data.draft)).sort((a, b) => {
  const byOrder = (a.data.order ?? 9999) - (b.data.order ?? 9999);
  return byOrder !== 0 ? byOrder : a.data.name.localeCompare(b.data.name);
});

const rendered = await Promise.all(
  speakers.map(async (speaker) => {
    const talk = speaker.data.talk ? await getEntry(speaker.data.talk) : undefined;
    const edition = talk?.data.edition ? await getEntry(talk.data.edition) : undefined;
    const { Content } = await render(speaker);
    return { speaker, Content, talkHref: edition ? `/events/${edition.id}` : '/talks' };
  }),
);
---

<BaseLayout title="Speakers" description="The people who have taken the TEDxKigali stage.">
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">Speakers</h1>

    {rendered.length === 0 ? (
      <p class="mt-8 text-muted">Speaker profiles are on their way.</p>
    ) : (
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rendered.map(({ speaker, Content, talkHref }) => (
          <SpeakerCard speaker={speaker} talkHref={talkHref}>
            <Content />
          </SpeakerCard>
        ))}
      </div>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 5: Aggiungere la sezione Speakers a `.pages.yml`**

Inserire nella lista `content`, dopo `talks`:

```yaml
  - name: speakers
    label: Speakers
    type: collection
    path: src/content/speakers
    filename: '{fields.name}.md'
    view:
      fields: [name, role]
    fields:
      - { name: name, label: Full name, type: string, required: true }
      - { name: role, label: Role or organisation, type: string }
      - { name: photo, label: Photo, type: image }
      - { name: photoAlt, label: Photo description, type: string, description: 'Required if you upload a photo.' }
      - name: talk
        label: Their talk
        type: reference
        options:
          collection: talks
          value: '{name}'
          label: '{fields.title}'
      - name: links
        label: Links
        type: object
        list: true
        fields:
          - { name: label, label: Name, type: string, required: true }
          - { name: url, label: Link, type: string, required: true }
      - { name: order, label: Display order, type: number, description: 'Lower numbers appear first.' }
      - { name: draft, label: Hide from the website, type: boolean, default: false }
      - { name: body, label: Short biography, type: rich-text }
```

- [ ] **Step 6: Verificare build, test e resa**

```bash
npm test
npm run build
npm run preview
```

Su `/speakers`: la scheda di Aline mostra l'iniziale al posto della foto mancante, la biografia e il link "Watch the talk" che porta alla pagina dell'edizione 2025.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/speakers src/components/SpeakerCard.astro src/pages/speakers.astro .pages.yml
git commit -m "feat: add speakers collection and page"
```

---

## Task 16: Partner e sponsor (Fase 2)

**Files:**
- Create: `src/components/SponsorGrid.astro`, `src/pages/partners.astro`, `src/content/sponsors/.gitkeep`
- Modify: `src/content.config.ts`, `src/pages/index.astro`, `.pages.yml`

**Interfaces:**
- Consumes: `resolveUploadedImage` (Task 4), `siteSettings` (Task 5)
- Produces: collection `sponsors`; `SponsorGrid` con props `{ tierOrder?: SponsorTier[] }`

- [ ] **Step 1: Aggiungere la collection `sponsors` in `src/content.config.ts`**

```ts
const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    name: z.string().min(1),
    logo: uploadPath,
    logoAlt: z.string().min(1, 'Describe the logo, for example "Acme Ltd logo".'),
    url: z.url().optional(),
    tier: z.enum(['headline', 'gold', 'partner', 'community']),
    order: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});
```

ed estendere l'export: `export const collections = { talks, events, speakers, sponsors };`

- [ ] **Step 2: Creare la cartella dei contenuti**

```bash
mkdir -p src/content/sponsors
touch src/content/sponsors/.gitkeep
```

Nessuno sponsor di esempio: i loghi reali richiedono file immagine, che arrivano nel Task 18.

- [ ] **Step 3: Scrivere `src/components/SponsorGrid.astro`**

```astro
---
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';
import { resolveUploadedImage } from '~/lib/images';

type SponsorTier = 'headline' | 'gold' | 'partner' | 'community';

interface Props {
  tierOrder?: SponsorTier[];
}

const { tierOrder = ['headline', 'gold', 'partner', 'community'] } = Astro.props;

const TIER_LABELS: Record<SponsorTier, string> = {
  headline: 'Headline partner',
  gold: 'Gold partners',
  partner: 'Partners',
  community: 'Community partners',
};

const sponsors = await getCollection('sponsors', ({ data }) => !data.draft);

const groups = tierOrder
  .map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    items: sponsors
      .filter((sponsor) => sponsor.data.tier === tier)
      .sort((a, b) => (a.data.order ?? 9999) - (b.data.order ?? 9999)),
  }))
  .filter((group) => group.items.length > 0);
---

{groups.length === 0 ? (
  <p class="text-muted">Partner logos will appear here soon.</p>
) : (
  groups.map((group) => (
    <section class="mt-10">
      <h2 class="text-sm font-bold uppercase tracking-widest text-muted">{group.label}</h2>
      <ul class="mt-4 flex flex-wrap items-center gap-8">
        {group.items.map((sponsor) => {
          const logo = resolveUploadedImage(sponsor.data.logo);
          const img = (
            <Image
              src={logo}
              alt={sponsor.data.logoAlt}
              widths={[200, 400]}
              sizes="200px"
              class="h-12 w-auto object-contain"
            />
          );
          return (
            <li>
              {sponsor.data.url ? (
                <a href={sponsor.data.url} target="_blank" rel="noopener noreferrer">{img}</a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  ))
)}
```

- [ ] **Step 4: Scrivere `src/pages/partners.astro`**

```astro
---
import BaseLayout from '~/layouts/BaseLayout.astro';
import SponsorGrid from '~/components/SponsorGrid.astro';
import { siteSettings } from '~/lib/settings';
---

<BaseLayout title="Partners" description="The organisations that make TEDxKigali possible.">
  <section class="mx-auto max-w-6xl px-4 py-16">
    <h1 class="text-4xl font-black uppercase md:text-6xl">Partners</h1>
    <p class="mt-4 max-w-2xl text-lg text-muted">
      TEDxKigali is run by volunteers and made possible by organisations that believe in
      sharing ideas.
    </p>

    <SponsorGrid />

    <div class="mt-16 rounded-lg border border-line bg-surface p-8">
      <h2 class="text-2xl font-bold uppercase tracking-wide">Become a partner</h2>
      <p class="mt-4 max-w-2xl text-muted">
        Want your organisation on this page? Write to us and we will send the partnership pack.
      </p>
      <a
        class="mt-6 inline-block rounded bg-ted-red px-6 py-3 font-bold uppercase tracking-wide text-ink hover:bg-ted-red/90"
        href={`mailto:${siteSettings.contactEmail}?subject=TEDxKigali%20partnership`}
      >
        Contact us
      </a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Aggiungere la striscia sponsor alla home**

In `src/pages/index.astro`, aggiungere l'import:

```astro
import SponsorGrid from '~/components/SponsorGrid.astro';
```

e inserire, subito prima della sezione About:

```astro
  <section class="mx-auto max-w-6xl px-4 pb-16">
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-2xl font-bold uppercase tracking-wide">Partners</h2>
      <a class="text-sm underline hover:no-underline" href="/partners">All partners</a>
    </div>
    <SponsorGrid tierOrder={['headline', 'gold']} />
  </section>
```

- [ ] **Step 6: Aggiungere la sezione Partners a `.pages.yml`**

```yaml
  - name: sponsors
    label: Partners
    type: collection
    path: src/content/sponsors
    filename: '{fields.name}.md'
    view:
      fields: [name, tier]
    fields:
      - { name: name, label: Organisation name, type: string, required: true }
      - { name: logo, label: Logo, type: image, required: true, description: 'PNG or SVG with a transparent background works best.' }
      - { name: logoAlt, label: Logo description, type: string, required: true, description: 'For example: Acme Ltd logo.' }
      - { name: url, label: Website, type: string }
      - name: tier
        label: Partner level
        type: select
        required: true
        options:
          values:
            - { value: headline, label: Headline partner }
            - { value: gold, label: Gold partner }
            - { value: partner, label: Partner }
            - { value: community, label: Community partner }
      - { name: order, label: Display order, type: number, description: 'Lower numbers appear first.' }
      - { name: draft, label: Hide from the website, type: boolean, default: false }
```

- [ ] **Step 7: Verificare build, test e resa**

```bash
npm test
npm run build
npm run preview
```

Su `/partners` compare il messaggio "Partner logos will appear here soon." (nessuno sponsor caricato) e il blocco "Become a partner"; la home mostra la sezione Partners senza rompersi.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/content/sponsors src/components/SponsorGrid.astro src/pages/partners.astro src/pages/index.astro .pages.yml
git commit -m "feat: add sponsors collection, partners page and home strip"
```

---

## Task 17: Dati strutturati dei video e rifinitura

**Files:**
- Create: `src/components/VideoJsonLd.astro`
- Modify: `src/pages/talks.astro`, `src/scripts/talk-filters.ts`, `src/pages/events/[slug].astro`, `src/components/TalkCard.astro`

> **Correzione obbligatoria da riportare prima dei filtri per tag.** `TalkCard.astro` serializza i tag con `tags.join(' ')`, ma un tag legittimo può contenere spazi (`public speaking`), e dividere sugli spazi produrrebbe token inesistenti facendo sparire il talk dai filtri. Cambiare in `data-tags={tags.join('|')}` e leggere con `split('|')`. Il carattere `|` non compare nei tag reali e non richiede escaping in un attributo HTML.

**Interfaces:**
- Consumes: `parseYouTubeId`, `youtubeThumbnails`, `youtubeWatchUrl`, `youtubeEmbedUrl` (Task 2)
- Produces: `VideoJsonLd` con props `{ talks: CollectionEntry<'talks'>[] }`

- [ ] **Step 1: Scrivere `src/components/VideoJsonLd.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { parseYouTubeId, youtubeEmbedUrl, youtubeThumbnails, youtubeWatchUrl } from '~/lib/youtube';
import { toJsonLd } from '~/lib/seo';

interface Props {
  talks: CollectionEntry<'talks'>[];
}

const { talks } = Astro.props;

const items = talks.flatMap((talk) => {
  const id = parseYouTubeId(talk.data.youtubeUrl);
  if (!id) return [];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: talk.data.title,
      description: talk.data.summary ?? `${talk.data.title} — a TEDxKigali talk by ${talk.data.speaker}.`,
      thumbnailUrl: youtubeThumbnails(id).primary,
      uploadDate: talk.data.date.toISOString(),
      contentUrl: youtubeWatchUrl(id),
      embedUrl: youtubeEmbedUrl(id),
      publisher: { '@type': 'Organization', name: 'TEDxKigali' },
    },
  ];
});
---

{items.map((item) => <script type="application/ld+json" is:inline set:html={toJsonLd(item)}></script>)}
```

- [ ] **Step 2: Aggiungere i dati strutturati alle pagine con i talk**

In `src/pages/talks.astro`, aggiungere l'import `import VideoJsonLd from '~/components/VideoJsonLd.astro';` e, come primo figlio di `<BaseLayout>`:

```astro
  <VideoJsonLd slot="head" talks={talks} />
```

In `src/pages/events/[slug].astro`, aggiungere lo stesso import e, accanto a `<EventJsonLd slot="head" ... />`:

```astro
  <VideoJsonLd slot="head" talks={talks} />
```

- [ ] **Step 3: Estendere i filtri dei talk ai tag**

Sostituire il corpo di `apply` in `src/scripts/talk-filters.ts` con:

```ts
function apply(kind: string, value: string): void {
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll<HTMLElement>('[data-talk]').forEach((card) => {
    const matches =
      value === 'all' ||
      (kind === 'edition' && card.dataset.edition === value) ||
      (kind === 'tag' && (card.dataset.tags ?? '').split('|').includes(value));

    card.hidden = !matches;
    if (matches) visible += 1;
  });

  if (empty) empty.hidden = visible > 0;
}
```

e aggiornare il gestore del clic per leggere anche il tipo di filtro:

```ts
  apply(button.dataset.filterKind ?? 'edition', button.dataset.filterValue ?? 'all');
```

In `src/pages/talks.astro`, aggiungere `data-filter-kind="edition"` ai bottoni delle edizioni, `data-filter-kind="all"` al bottone "All", e sotto la fila delle edizioni una seconda fila per i tag:

```astro
---
const tags = [...new Set(talks.flatMap((talk) => talk.data.tags))].sort();
---

{tags.length > 0 && (
  <div class="mt-3 flex flex-wrap gap-2">
    {tags.map((tag) => (
      <button
        type="button"
        data-filter-kind="tag"
        data-filter-value={tag}
        aria-pressed="false"
        class="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted aria-pressed:border-kigali-sun aria-pressed:text-ink"
      >
        {tag}
      </button>
    ))}
  </div>
)}
```

Spostare questa fila **dentro** il contenitore `#talk-filters` in modo che il gestore di clic la intercetti.

- [ ] **Step 4: Verificare i dati strutturati e i filtri**

```bash
npm run build
npm run preview
```

1. Nel sorgente di `/talks` compaiono blocchi `"@type": "VideoObject"`, uno per talk.
2. Cliccando un tag restano solo i talk con quel tag; "All" ripristina tutto.
3. Incollare l'HTML di `/events/tedxkigali-2026` nel Rich Results Test di Google (<https://search.google.com/test/rich-results>): l'evento deve essere riconosciuto senza errori.

- [ ] **Step 5: Verificare test e build**

```bash
npm test
npm run build
```

Expected: verdi.

- [ ] **Step 6: Commit**

```bash
git add src/components/VideoJsonLd.astro src/pages/talks.astro src/scripts/talk-filters.ts src/pages/events/\[slug\].astro
git commit -m "feat: add VideoObject structured data and tag filters"
```

---

## Task 18: Messa in produzione e verifiche finali

**Files:**
- Modify: `astro.config.mjs`, `public/robots.txt`, `src/content/settings/site.json`, contenuti reali in `src/content/`
- Create: `README.md`

**Interfaces:**
- Consumes: tutto quanto precede
- Produces: sito online

- [ ] **Step 1: Raccogliere i dati operativi**

Ottenere dal team di Kigali gli elementi elencati nella §21 della spec: dominio e accesso DNS, account GitHub proprietario e dei redattori, logo e fotografie, elenco dei talk YouTube reali, email pubblica e social, testo di licenza TEDx richiesto da TED.

- [ ] **Step 2: Sostituire dominio ed email**

```bash
sed -i 's|https://tedxkigali.rw|https://IL-DOMINIO-REALE|' astro.config.mjs public/robots.txt
```

Aggiornare `contactEmail`, `socials` e `tedxLicenceNotice` in `src/content/settings/site.json` con i valori confermati.

- [ ] **Step 3: Sostituire i contenuti di esempio con quelli reali**

Rimuovere i due talk segnaposto e i due eventi di esempio, inserendo i contenuti reali:

```bash
rm src/content/talks/2025-10-18-the-hills-that-listen.md
rm src/content/talks/2025-10-18-rebuilding-trust.md
rm src/content/speakers/aline-uwase.md
```

Creare gli eventi e i talk reali seguendo la stessa struttura di frontmatter. Verificare dopo ogni aggiunta con `npm run build`.

- [ ] **Step 4: Scrivere `README.md`**

```markdown
# TEDxKigali website

Static website for TEDxKigali. Built with Astro, edited through Pages CMS,
deployed on Vercel. No backend: ticketing lives on an external platform.

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies (Node 22) |
| `npm run dev` | Local dev server on http://localhost:4321 |
| `npm test` | Unit tests |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Editing content

Editors use <https://app.pagescms.org> — see [docs/EDITING.md](docs/EDITING.md).
Content lives in `src/content/`, uploaded images in `src/assets/uploads/`.

## Design documents

- Design spec: `docs/superpowers/specs/2026-08-22-tedx-kigali-site-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-22-tedx-kigali-site.md`
```

- [ ] **Step 5: Pubblicare il repository su GitHub**

```bash
gh repo create tedxkigali --private --source=. --remote=origin
git push -u origin main
```

Aggiungere i redattori come collaboratori con permesso di scrittura dalle impostazioni del repository.

- [ ] **Step 6: Collegare Vercel**

1. Su vercel.com, **Add New → Project**, importare il repository.
2. Il preset Astro viene rilevato automaticamente; confermare `npm run build` e cartella di output `dist`.
3. In **Settings → General**, impostare Node.js 22.
4. In **Settings → Domains**, aggiungere il dominio e configurare i record DNS indicati.
5. In **Settings → Notifications**, verificare che le email di build fallito arrivino anche all'indirizzo della redazione.

- [ ] **Step 7: Collegare Pages CMS ed eseguire la verifica rimandata dal Task 13**

Eseguire ora tutti i punti dello Step 3 del Task 13 sul repository reale, incluso il test di creazione e cancellazione di un talk di prova.

- [ ] **Step 8: Prova di aggiornamento fatta dalla redazione**

Far eseguire **a una persona del team di Kigali**, seguendo solo `docs/EDITING.md` e senza aiuto:

1. aggiungere un talk;
2. aggiungere un evento con link di prenotazione;
3. mettere un talk in evidenza sulla home.

Annotare ogni punto in cui si è bloccata e correggere `docs/EDITING.md` o le etichette in `.pages.yml` di conseguenza.

- [ ] **Step 9: Verifiche finali sul sito in produzione**

1. **Video**: riproduzione su Android Chrome, iOS Safari e desktop; l'audio si interrompe alla chiusura dell'overlay.
2. **Rete**: nella scheda Network, nessuna richiesta a `youtube.com` prima del clic sul play.
3. **Prenotazione**: il pulsante apre la piattaforma esterna in una nuova scheda.
4. **Lighthouse mobile** su home, `/talks` e `/events`: ≥ 95 nelle quattro categorie. Se Performance scende sotto la soglia, verificare per prima cosa il peso delle immagini caricate.
5. **Dati strutturati**: Rich Results Test sull'URL pubblico dell'evento.
6. **Accessibilità**: navigazione completa da tastiera, contrasti, testo alternativo su tutte le immagini.
7. **Fuso orario del CMS**: creare un evento di prova da un browser **non** impostato su Africa/Kigali e verificare che il valore salvato in `startDate` finisca in `+02:00`. Se il widget del CMS deriva l'offset dal fuso del redattore, un volontario che scrive dall'estero salverebbe l'istante sbagliato e l'orario mostrato sul sito sarebbe errato.
8. **Riferimento normativo**: far confermare da qualcuno con conoscenza legale locale che la citazione della legge rwandese 058/2021 nella pagina privacy sia corretta per numero e titolo. Una citazione sbagliata su una pagina privacy pubblica e' di per se' un problema di credibilita'.
9. **Marchio TEDx**: footer con la dicitura di licenza e la spiegazione della `x` su ogni pagina; confronto con la guida ufficiale per gli organizzatori TEDx.

- [ ] **Step 10: Commit finale**

```bash
git add -A
git commit -m "chore: launch configuration, real content and README"
git push
```

---

## Note di esecuzione

- **Task 1–14 = Fase 1** della spec: il sito completo e pubblicabile per il prossimo evento.
- **Task 15–17 = Fase 2**: speaker, partner, dati strutturati dei video, filtri per tag.
- **Task 18** si esegue una volta sola, quando i contenuti reali e gli accessi sono disponibili; i suoi Step 1 e 3 dipendono da materiale fornito dal team di Kigali e vanno pianificati con anticipo.
