# TEDx Kigali — Sito web pubblico

**Data:** 2026-08-22
**Stato:** design approvato, in attesa del piano di implementazione

> Nota di lingua: questa spec è in italiano perché è il documento di lavoro fra committente e sviluppo.
> **Il sito, l'interfaccia del CMS e la guida per la redazione sono interamente in inglese.**

---

## 1. Obiettivo

Un sito vetrina per TEDx Kigali che faccia tre cose bene:

1. far vedere i talk delle edizioni passate, con riproduzione immediata dentro il sito;
2. annunciare i prossimi eventi e mandare le persone alla piattaforma di biglietteria esterna;
3. essere aggiornabile da una persona non tecnica, senza toccare codice e senza poter rompere il sito.

Pubblico primario: pubblico rwandese su rete mobile, spesso 3G/4G, su telefono Android di fascia media.
Pubblico secondario: potenziali speaker, sponsor e stampa internazionale.

## 2. Non obiettivi

- Nessun backend, nessun database, nessuna autenticazione utenti sul sito.
- Nessuna gestione di pagamenti o biglietti: la biglietteria è **sempre** su piattaforma terza, raggiunta via link.
- Nessuna area riservata, nessun commento, nessuna newsletter con archivio proprio.
- Nessun multilingua: il sito è solo in inglese (l'architettura non lo preclude in futuro, ma non lo prevede ora).

## 3. Decisioni prese

| Tema | Decisione |
|---|---|
| Aggiornamento contenuti | CMS visuale su Git: **Pages CMS** (pagescms.org), gratuito e open source |
| Sorgente dei contenuti | File Markdown + JSON nel repo GitHub |
| Generatore | **Astro 5**, output statico puro |
| Stile | **Tailwind CSS**, nessun framework JS |
| Hosting | **Vercel** (piano Hobby), deploy automatico da GitHub |
| Biglietteria | Campo URL generico per evento: qualsiasi piattaforma |
| Lingua | Solo inglese |
| Direzione visiva | TEDx classico (nero/rosso) con accenti fotografici e cromatici di Kigali |

## 4. Architettura

```
Editor  ──▶ Pages CMS (app.pagescms.org)
                 │  commit
                 ▼
            GitHub repo  ──▶ Vercel build (astro build)
                                  │
                                  ▼
                            Sito statico su CDN
```

Nessun processo attivo in produzione: solo file statici. Il JavaScript nel browser serve
esclusivamente al player video, al menu mobile, ai filtri dei talk e al ricalcolo dello stato
degli eventi (§9).

### 4.1 Struttura del repo

```
src/
  assets/uploads/        immagini caricate dall'editor tramite CMS
  components/            componenti Astro (Header, Footer, TalkCard, EventCard, VideoLightbox, ...)
  content/
    talks/               un file .md per talk
    events/              un file .md per evento/edizione
    speakers/            un file .md per speaker
    sponsors/            un file .md per sponsor
    settings/site.json   testi e impostazioni globali
  layouts/               BaseLayout.astro
  lib/                   youtube.ts, images.ts, events.ts, seo.ts
  pages/                 rotte del sito
  scripts/               video-lightbox.ts, event-status.ts, talk-filters.ts, nav.ts
  styles/                global.css (design token)
public/                  favicon, og-default.jpg, robots.txt
docs/EDITING.md          guida per la redazione (in inglese)
.pages.yml               configurazione del CMS
```

### 4.2 Rete di sicurezza sui contenuti

Ogni collection ha uno schema di validazione Zod. Se un campo obbligatorio manca, una data è
malformata o un link YouTube non è riconoscibile, **il build fallisce con un messaggio esplicito e
Vercel mantiene online il deploy precedente**. Il sito pubblico non si rompe mai per colpa di un
errore di redazione; l'editor riceve la notifica di build fallito da Vercel e corregge nel CMS.

Corollario: ogni messaggio di errore di validazione deve essere scritto in inglese e in linguaggio
non tecnico, perché lo leggerà la redazione. Esempio richiesto:
`"YouTube link not recognised. Paste the full link from the browser address bar, e.g. https://www.youtube.com/watch?v=..."`.

---

## 5. Modello dei contenuti

Tutti i campi immagine sono accompagnati da un campo testo alternativo obbligatorio, per accessibilità.
`draft: true` esclude l'elemento dal sito pubblico ma lo conserva nel repo.

### 5.1 `talks`

| Campo | Tipo | Obbl. | Note |
|---|---|---|---|
| `title` | testo | sì | Titolo del talk |
| `speaker` | testo | sì | Nome dello speaker come appare nel video |
| `youtubeUrl` | URL | sì | Qualsiasi formato YouTube; validato in fase di build |
| `date` | data | sì | Data del talk; determina l'ordinamento |
| `edition` | riferimento a `events` | no | Collega il talk all'edizione |
| `summary` | testo (max 300) | no | Mostrato sotto il titolo nella griglia |
| `thumbnail` | immagine | no | Sostituisce la copertina automatica di YouTube |
| `thumbnailAlt` | testo | se c'è `thumbnail` | |
| `featured` | sì/no | no | Se sì, compare fra i talk in evidenza in home |
| `tags` | lista di testi | no | Usati come filtro secondario |
| `draft` | sì/no | no | Default `false` |

### 5.2 `events`

| Campo | Tipo | Obbl. | Note |
|---|---|---|---|
| `title` | testo | sì | Es. "TEDxKigali 2026 — Rising" |
| `startDate` | data e ora | sì | Con fuso `Africa/Kigali` (CAT, UTC+2) |
| `endDate` | data e ora | no | Se assente si assume +4 ore |
| `venue` | testo | sì | Nome della sede |
| `address` | testo | no | |
| `mapUrl` | URL | no | Link a mappa esterna |
| `image` | immagine | no | Immagine di copertina dell'evento |
| `imageAlt` | testo | se c'è `image` | |
| `theme` | testo | no | Tema dell'edizione |
| `summary` | testo (max 300) | sì | Usato in home, nelle liste e nei meta social |
| corpo del file | Markdown | no | Descrizione lunga nella pagina evento |
| `bookingUrl` | URL | no | Link alla piattaforma esterna |
| `bookingLabel` | testo | no | Default `Book your seat` |
| `ticketStatus` | scelta | sì | `coming-soon` / `open` / `free` / `sold-out` / `closed` |
| `draft` | sì/no | no | Default `false` |

Regola di validazione: se `ticketStatus` è `open` o `free`, `bookingUrl` diventa obbligatorio.

### 5.3 `speakers`

`name` (obbl.), `photo` + `photoAlt`, `role`, bio in Markdown, `talk` (riferimento a `talks`),
`links` (lista di `label` + `url`), `order` (numero, per l'ordinamento manuale), `draft`.

### 5.4 `sponsors`

`name` (obbl.), `logo` + `logoAlt` (obbl.), `url`, `tier` (`headline` / `gold` / `partner` / `community`), `order`, `draft`.

### 5.5 `settings/site.json`

Singolo file modificabile dal CMS: titolo e sottotitolo hero, immagine hero + alt, testo About breve
e lungo, email di contatto, elenco social, nota di licenza TEDx nel footer, titolo e descrizione SEO
di default, immagine social di default.

---

## 6. Configurazione del CMS

File `.pages.yml` nella radice del repo. Definisce per ogni collection i campi, le etichette in
inglese, i testi di aiuto e il pattern del nome file (`{year}-{month}-{day}-{slug}`).

- **Media**: `input: src/assets/uploads`, `output: src/assets/uploads`. Il percorso salvato nel
  frontmatter è relativo alla radice del repo, ed è ciò che il risolutore immagini (§10) si aspetta.
- **Accesso**: l'app GitHub di Pages CMS va installata sul repo; ogni redattore deve avere un account
  GitHub gratuito ed essere collaboratore del repo. Non serve altro: nessuna app OAuth da configurare.
- **Testi di aiuto obbligatori** su: campo link YouTube (dove trovare il link), campo data (fuso di
  Kigali), campo immagine (indicazione di caricare foto di larghezza ragionevole), campo link
  prenotazione (incollare l'URL della piattaforma esterna).

---

## 7. Pagine

| Rotta | Contenuto |
|---|---|
| `/` | Hero; prossimo evento in evidenza con pulsante di prenotazione; 3–6 talk in evidenza; anteprima speaker; striscia sponsor; estratto About con link |
| `/talks` | Griglia di tutti i talk, filtrabile per edizione/anno e per tag, con player in overlay |
| `/events` | Prossimi eventi (con prenotazione) e archivio delle edizioni passate |
| `/events/[slug]` | Pagina evento: descrizione, data, sede, mappa, prenotazione, talk di quell'edizione |
| `/speakers` | Elenco speaker con foto, ruolo, bio breve e link al proprio talk |
| `/about` | Che cos'è TEDx, storia di TEDx Kigali, team, come proporsi come speaker o volontario |
| `/partners` | Sponsor per livello, più invito a diventare partner con email di contatto |
| `/privacy` | Informativa breve (§14) |
| `/404` | Pagina di errore con link ai talk e agli eventi |

Contatti: sezione con email e social nel footer di ogni pagina, senza form (nessun backend).

---

## 8. Player video

**Tecnica facade.** In griglia ogni talk è una semplice immagine con overlay del pulsante play:
nessun codice YouTube viene caricato all'apertura della pagina. Al clic si apre un overlay a schermo
intero, viene inserito l'iframe e **il talk parte subito con l'audio**, senza lasciare il sito.

- Dominio embed: `www.youtube-nocookie.com`.
- Parametri: `autoplay=1`, `rel=0`, `modestbranding=1`, `playsinline=1`.
- L'overlay usa l'elemento nativo `<dialog>` con `showModal()`: chiusura con Esc, clic sullo sfondo o
  pulsante X; gestione del focus e blocco dello scroll di fondo gratis dal browser.
- Alla chiusura l'iframe viene **rimosso dal DOM**, così l'audio si interrompe davvero.
- Un solo `<dialog>` riutilizzato per tutta la pagina.

**Copertine.** `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`, con fallback automatico su
`hqdefault.jpg` gestito dall'evento `onerror` dell'immagine, perché `maxresdefault` non esiste per
tutti i video. Il campo `thumbnail` del CMS ha comunque la precedenza su entrambi.

**Parsing dei link.** `src/lib/youtube.ts` riconosce `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`,
`/live/`, con parametri aggiuntivi e con o senza `www`. Restituisce `null` su input non valido, il che
fa fallire la validazione dello schema con messaggio comprensibile.

**Limite noto e accettato**: su alcune versioni di iOS l'avvio automatico dentro un iframe può
richiedere un secondo tocco sul pulsante play. È una restrizione del sistema operativo, non aggirabile
da un sito web. Su desktop e Android parte al primo clic.

---

## 9. Stato degli eventi (prossimi vs archivio)

Il sito è statico: senza accorgimenti, un evento resterebbe "in programma" finché qualcuno non
ricostruisce il sito.

Soluzione a due livelli, **senza alcun processo pianificato**:

1. **A build time** gli eventi vengono divisi in prossimi e passati e ordinati.
2. **Nel browser**, uno script confronta `data-start`/`data-end` di ogni card con l'ora corrente e
   corregge: sposta le card scadute nella sezione archivio, marca come "Happening now" un evento in
   corso, e disattiva il pulsante di prenotazione degli eventi conclusi.

Motivazione esplicita: un workflow pianificato su GitHub Actions verrebbe **disattivato automaticamente
dopo 60 giorni di inattività del repo** — condizione normalissima fra un'edizione TEDx e l'altra — e il
sito mostrerebbe in silenzio un evento passato come prenotabile.

Se il JavaScript è disabilitato, resta valida la classificazione del build: comportamento degradato ma
mai errato in modo pericoloso (la data è sempre visibile accanto al pulsante).

---

## 10. Immagini

Le immagini caricate dal CMS finiscono in `src/assets/uploads/`, **non** in `public/`, in modo da
passare dalla pipeline di Astro: conversione in WebP, generazione delle varianti per le diverse
larghezze di schermo, `width`/`height` espliciti e `loading="lazy"` fuori dalla prima schermata.

Poiché il percorso salvato dal CMS è una stringa relativa alla radice del repo, `src/lib/images.ts`
risolve il file con `import.meta.glob` su `/src/assets/uploads/**` (modalità `eager`) e restituisce
l'asset da passare al componente `<Image>` di Astro. Se il file non esiste il build fallisce con un
messaggio che indica il nome atteso.

Motivazione: è il rischio di performance più concreto del progetto. Una foto scattata col telefono pesa
diversi megabyte, e il pubblico di riferimento naviga in 3G/4G.

---

## 11. Design system

**Colori** (token CSS in `src/styles/global.css`):

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#0A0A0A` | Sfondo |
| `--surface` | `#161616` | Card, overlay |
| `--text` | `#FFFFFF` | Testo primario |
| `--text-muted` | `#A3A3A3` | Testo secondario (contrasto ≈ 8:1 sul fondo) |
| `--red` | `#EB0028` | Rosso TED |
| `--green` | `#2E7D5B` | Accento Kigali (colline) |
| `--sky` | `#3B7EA1` | Accento Kigali (cielo) |
| `--sun` | `#E8B44A` | Accento per tag e livelli sponsor |

**Regola vincolante sul rosso**: `#EB0028` su fondo scuro non raggiunge il rapporto di contrasto AA per
il testo di dimensioni normali. Il rosso è ammesso **solo** per titoli di grandi dimensioni, sfondi di
pulsanti (con testo bianco sopra), bordi, linee e icone. Mai per testo corrente né per link inline.

**Tipografia**: Inter variabile, ospitata localmente (nessuna richiesta a Google Fonts), con fallback
`Helvetica Neue, Helvetica, Arial, sans-serif`. Titoli in maiuscolo con spaziatura ridotta, corpo testo
in tondo. Scala tipografica fluida.

**Layout**: mobile-first, contenuto entro 1200px, griglia a 1/2/3 colonne. Animazioni sobrie, tutte
disattivate sotto `prefers-reduced-motion`.

---

## 12. Conformità al marchio TEDx

Requisiti da rispettare nel sito, derivanti dalla licenza TEDx:

- Il nome si scrive **TEDxKigali**, senza spazio, con `TED` e `x` nella forma prevista dal marchio.
- Nel footer di ogni pagina compare la spiegazione della `x`
  (*"x = independently organized TED event"*) e la dicitura sulla licenza:
  *"This independent TEDx event is operated under license from TED."*
- Il testo esatto della dicitura è modificabile dal CMS (`settings/site.json`), perché TED può
  aggiornare la formulazione richiesta.
- Prima della pubblicazione, il sito va confrontato con la guida ufficiale per gli organizzatori TEDx
  e, se prevista, con l'eventuale approvazione del licensee.

---

## 13. SEO e dati strutturati

- Titoli, descrizioni e URL canonici per ogni pagina; immagini di anteprima social per evento e per talk.
- **JSON-LD `Event`** su ogni evento: nome, data di inizio e fine, luogo, immagine, descrizione e
  `offers` con il link di prenotazione e lo stato dei biglietti. È la voce a più alto ritorno del
  progetto: consente a Google di mostrare la scheda evento con data e link ai biglietti.
- **JSON-LD `VideoObject`** su ogni talk (titolo, miniatura, data, URL di embed).
- `Organization` sul sito, sitemap XML tramite `@astrojs/sitemap`, `robots.txt`.

---

## 14. Privacy

- Nessun analytics attivo alla consegna. Se in futuro servisse una misurazione, si valuterà uno
  strumento senza cookie (es. Plausible o Umami), e in tal caso la pagina privacy va aggiornata.
- Nessuna richiesta a domini terzi al caricamento delle pagine: font ospitati localmente, immagini dal
  repo, miniature YouTube dal CDN `i.ytimg.com`.
- YouTube viene contattato **solo dopo un clic esplicito** sul pulsante play: la scelta dell'utente è
  l'atto di consenso, e per questo non è necessario un banner bloccante.
- Pagina `/privacy` in inglese: cosa succede quando si riproduce un video, quali dati raccoglie
  YouTube, che il sito non usa cookie propri, e a chi scrivere. Riferimento alla legge rwandese
  058/2021 sulla protezione dei dati.

---

## 15. Accessibilità e performance

**Accessibilità (obiettivo WCAG 2.1 AA)**: struttura per landmark, skip link, focus sempre visibile,
overlay video con `<dialog>` nativo, testo alternativo obbligatorio su tutte le immagini da CMS,
contrasti verificati, navigazione completa da tastiera, `prefers-reduced-motion` rispettato.

**Budget di performance** (misurato su Vercel in produzione, profilo mobile):

- home < 150 KB trasferiti escluse le immagini;
- nessuno script di terze parti prima di un'interazione dell'utente;
- LCP < 2,5 s in condizioni "Slow 4G";
- Lighthouse mobile ≥ 95 su Performance, Accessibility, Best Practices, SEO.

---

## 16. Test

Non essendoci backend, i test coprono ciò che può davvero rompersi:

**Unitari (Vitest)**
- parsing dei link YouTube: tutti i formati supportati, formati malformati, ID di lunghezza errata;
- costruzione degli URL di embed e delle miniature;
- classificazione degli eventi per data: futuro, in corso, passato, evento senza `endDate`,
  correttezza attorno alla mezzanotte nel fuso `Africa/Kigali`;
- risoluzione dei percorsi immagine, incluso il caso "file mancante".

**Di integrazione**
- il build fallisce su contenuto non valido (link YouTube errato, `ticketStatus: open` senza
  `bookingUrl`, immagine inesistente) e il messaggio è comprensibile a un non tecnico;
- il build riesce su un set di contenuti di esempio e genera tutte le rotte attese.

**Automazione**
- GitHub Action su ogni push e pull request: `npm ci`, test, `astro build`. È attivata da eventi, non
  pianificata, quindi non soffre della disattivazione dopo 60 giorni.

**Manuali prima del lancio**
- riproduzione video su Android Chrome, iOS Safari e desktop;
- prova di aggiunta di un video e di un evento eseguita **dalla redazione**, non dallo sviluppatore;
- Lighthouse; controllo dei dati strutturati con il Rich Results Test di Google.

---

## 17. Deploy

- Repo GitHub, branch `main` = produzione; ogni pull request genera un'anteprima Vercel.
- Vercel: preset Astro, output statico, `npm ci` + `npm run build`.
- Dominio personalizzato da configurare al momento della messa online.
- In caso di build fallito resta online il deploy precedente; notifica via email all'editor.
- **Portabilità**: non viene usata alcuna funzionalità specifica di Vercel, quindi il sito è
  trasferibile su Cloudflare Pages o Netlify senza modifiche al codice. Da tenere presente perché il
  piano gratuito Hobby di Vercel esclude l'uso commerciale.

---

## 18. Documentazione per la redazione

`docs/EDITING.md`, in inglese, scritto per chi non ha competenze tecniche:

1. come accedere al CMS;
2. aggiungere un talk (dove copiare il link YouTube);
3. aggiungere un evento e il link di prenotazione;
4. aggiungere uno speaker e uno sponsor;
5. modificare i testi della home e dell'About;
6. che cosa succede dopo il salvataggio e quanto tempo serve per vedere le modifiche online;
7. che cosa fare se arriva un'email di build fallito.

Da completare con screenshot reali dopo la messa in produzione.

---

## 19. Rischi noti

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Pages CMS è un progetto con pochi manutentori | Medio | I contenuti sono Markdown nel repo: si passa a Sveltia o Decap CMS senza toccare il sito |
| I redattori devono avere un account GitHub | Basso | Account gratuito, configurato una volta sola in fase di consegna |
| Autoplay non garantito su iOS | Basso | Limite di sistema; il video parte comunque al tocco successivo |
| Vercel Hobby vieta l'uso commerciale | Basso | Sito portabile su Cloudflare Pages in tempi brevi |
| Foto molto pesanti caricate dal CMS | Basso | Ottimizzazione automatica in build + indicazione nel form |
| Video YouTube rimosso o reso privato | Basso | La copertina resta, il player mostra l'errore di YouTube; da verificare periodicamente |

---

## 20. Ordine di consegna

**Fase 1 — il sito che serve per vendere biglietti e mostrare i talk**
Impostazione progetto e design system; collection `talks` e `events`; Home, Talks, Events, pagina
evento, About, Privacy, 404; overlay video; configurazione CMS per talk ed eventi; JSON-LD Event;
deploy su Vercel; `EDITING.md`.

**Fase 2 — completamento**
Collection `speakers` e `sponsors`; pagine Speakers e Partners; anteprime in home; filtri per tag sui
talk; JSON-LD VideoObject; rifinitura fotografica e animazioni.

Le due fasi sono entrambe parte della consegna: l'ordine serve a garantire che, se qualcosa slitta,
slitti ciò che non blocca il prossimo evento.

---

## 21. Informazioni da raccogliere prima della messa online

Non sono scelte di design aperte, ma dati operativi da fornire al momento del deploy:

- nome a dominio e accesso al pannello DNS;
- account GitHub proprietario del repo e account dei redattori;
- logo TEDxKigali nei formati ufficiali e materiale fotografico delle edizioni passate;
- elenco dei talk YouTube esistenti e delle edizioni;
- email di contatto pubblica e profili social;
- testo di licenza TEDx nella formulazione richiesta da TED al momento del lancio.
