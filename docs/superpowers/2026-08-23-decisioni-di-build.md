# SDD ledger — plan: docs/superpowers/plans/2026-08-22-tedx-kigali-site.md

Spec: docs/superpowers/specs/2026-08-22-tedx-kigali-site-design.md (letta, autorevole)
Base branch: main @ 0df218f (repo appena inizializzato, nessun codice preesistente)

## Pre-flight scan

### Coppie di task che condividono file o interfacce

| Task A | Task B | Produce / consuma | Esito |
|---|---|---|---|
| 1 | 10 | src/styles/global.css creato / modificato (@plugin typography) | ok |
| 1 | 6,7,8,11,16 | src/pages/index.astro creato / riscritto piu volte | ok, sequenza esplicita: 1 temp -> 6 layout -> 7 griglia temporanea -> 8 rimozione -> 11 finale -> 16 sezione partner |
| 2 | 5,7,17 | parseYouTubeId/youtubeEmbedUrl/youtubeThumbnails/youtubeWatchUrl | ok, firme coerenti |
| 3 | 5,9,10,11 | TICKET_STATUSES, TicketStatus, eventState, eventEnd, isBookable, ticketStatusLabel | ok dopo la correzione in autorevisione (tupla as const, niente cast) |
| 4 | 7,9,10,15,16 | resolveUploadedImage | ok |
| 5 | 6,11,12,16 | siteSettings | ok |
| 5 | 15,16 | src/content.config.ts creato / esteso (uploadPath, glob, reference gia importati) | ok |
| 6 | 7 | src/layouts/BaseLayout.astro creato / modificato (VideoDialog) | ok |
| 6 | 8,9,10,11,12,15,16 | BaseLayout, canonicalUrl, buildPageTitle | ok |
| 7 | 8,10,11 | TalkCard props {talk, editionTitle} | ok |
| 8 | 17 | src/scripts/talk-filters.ts + DOM #talk-filters | ok, Task 17 cambia la firma di apply() e aggiunge data-filter-kind ai bottoni esistenti |
| 9 | 11 | EventCard props {event, now} | ok |
| 10 | 17 | src/pages/events/[slug].astro creato / modificato | ok |
| 13 | 15,16 | .pages.yml creato / esteso | ok, nomi campo allineati agli schemi Zod |
| 14 | tutti i precedenti | CI esegue npm test + npm run build | ok, posizionato dopo il Task 13 |
| 15 | 18 | speaker di esempio referenzia un talk di esempio | ok, il Task 18 cancella entrambi insieme |

### Coerenza interna dei singoli task

| Task | Verifica | Esito |
|---|---|---|
| 1 | file creati vs file toccati dopo; script npm usati dai task seguenti | CONFLITTO 1 (vedi sotto) |
| 2,3,4 | test dichiarati vs codice dichiarato vs interfacce esposte | ok |
| 5 | schemi vs contenuti di esempio vs passi di verifica del fallimento build | ok |
| 6 | BaseLayout props vs uso nei task seguenti | ok |
| 7 | contratto DOM del dialog vs script | ok |
| 8 | filtri vs attributi dati emessi da TalkCard nel Task 7 | ok |
| 9 | script client vs markup della pagina | CONFLITTO 2 (vedi sotto) |
| 10,11,12 | import vs dipendenze installate (typography nel Task 10) | ok |
| 13 | nomi campo .pages.yml vs schemi Zod del Task 5 | ok |
| 14 | comandi CI vs script npm del Task 1 | ok |
| 15,16 | estensioni content.config.ts vs export collections | ok |
| 17 | modifiche a talks.astro e talk-filters.ts vs versioni del Task 8 | ok |
| 18 | file cancellati vs riferimenti residui | ok |

### Conflitti trovati e rulings

CONFLITTO 1 — Il Task 1 non aggiunge `.superpowers/` a `.gitignore`, ma i Task 1 e 18 usano `git add -A`: il ledger SDD finirebbe committato nel repo del cliente.
Ruling: aggiungere `.superpowers/` al `.gitignore` nel Task 1, passo aggiuntivo prima del commit. Se sbagliato: costo nullo, e' una riga di gitignore.

CONFLITTO 2 — Task 9: `src/pages/events/index.astro` ha il paragrafo `#events-none` con `hidden={upcoming.length > 0}`, ma `src/scripts/event-status.ts` non lo aggiorna mai. Se al caricamento tutti gli eventi risultano passati, la sezione Upcoming viene nascosta e il messaggio di stato vuoto resta invisibile: la pagina mostra solo l'archivio senza spiegare nulla.
Ruling: `event-status.ts` deve mostrare `#events-none` quando `#events-upcoming` resta senza figli, cioe' esattamente l'inverso di `#events-upcoming-section`. Se sbagliato: costo minimo, un messaggio di stato vuoto in piu' o in meno.

RULING 3 — Esecuzione su `main` senza git worktree isolato.
Motivo: progetto greenfield, repo creato in questa sessione, nessun ramo o lavoro parallelo da cui isolarsi; il piano approvato dall'utente inizializza esplicitamente il repo su `main` (Task 1 Step 1). Se sbagliato: nessun isolamento da lavoro concorrente, che qui non esiste.

## Progress

Task 1: dispatched (implementer sonnet, BASE 0df218f) — scaffolding Astro+Tailwind+Vitest; rulings 1 e 2 del pre-flight passati nel dispatch
Task 1: report DONE_WITH_CONCERNS (commit c3ae0b6) — concern sulla versione di Astro, trattato prima della review come da skill (concern di correttezza)
Task 1: Ruling: si adotta Astro 7 invece di Astro 5. Verificato sulle guide di upgrade ufficiali v6 e v7: le uniche rotture che toccano questo piano sono (a) `z` da `astro/zod` invece che da `astro:content`, (b) niente tag auto-chiusi per elementi non-void (compilatore Rust), (c) Node >= 22.12. Content collections con loader, render(), astro:assets e @astrojs/sitemap 3.7.3 restano compatibili. Motivo: lanciare un sito manutenuto da volontari partendo due major indietro e' un costo crescente. Se sbagliato: si ripunta astro a ^5 e si ripristinano due import — rework contenuto, tutto in Task 1.
Task 1: spec e piano aggiornati (commit successivo a c3ae0b6), Global Constraints estesi con le tre regole Astro 7; brief 1 rigenerato
Task 1: fix Astro 7 applicato (commit 363e064, astro@7.2.4, zod autonomo rimosso, engines node >=22.12); build e test verdi
Task 1: Ruling: la vulnerabilita' alta su sharp (<0.35.0, GHSA-f88m-g3jw-g9cj, CVE-2026-33327/33328/35590/35591 da libvips) va corretta dentro il Task 1, non differita. Motivo: sharp e' la libreria che elabora in build le immagini caricate dalla redazione tramite CMS, cioe' file di terze parti — e' lo scenario esatto delle CVE, non una dipendenza di sviluppo. Se sbagliato: si e' speso un bump di versione in piu' del necessario.
Task 1: sharp risolto a 0.35.3 senza overrides, npm audit --omit=dev pulito (commit 8a04c9f); astro resta 7.2.4
Task 1: task reviewer dispatchato (sonnet) su range 0df218f..8a04c9f
Task 1: review 1 — spec ❌ (1 Important), quality Needs fixes
Task 1: Ruling: il rilievo "npm run check non funzionante" e' plan-mandated e va accolto, non respinto. Il piano imponeva lo script `check` ma il suo Step 3 non installava @astrojs/check e typescript; il revisore ha eseguito lo script e verificato che si blocca su un prompt interattivo (in CI resterebbe appeso). Piano corretto e ricommittato; fix affidato all'implementer. Se sbagliato: due devDependencies in piu', costo nullo.
Task 1: minor (deferred): .nvmrc pinna "22" mentre engines.node richiede >=22.12 — una 22.0-22.11 preinstallata soddisferebbe nvm ma non engines
Task 1: minor (deferred): il report iniziale attribuisce al brief un "documented fallback" per la scrittura a mano dei file che il brief non documenta; nessun impatto sul codice, che combacia col brief
Task 1: fix round 1/5 dispatchato e rientrato (commit 142edc9, npm run check ora non interattivo, 0 errori; audit pulito); re-review scoped dispatchata (haiku) su 8a04c9f..142edc9
Task 1: fix round 1/5 (1 addressed, 0 open; commits 8a04c9f..142edc9)
Task 1: complete (commits 0df218f..142edc9, review clean)
Task 2: dispatched (implementer haiku, BASE 142edc9) — src/lib/youtube.ts in TDD stretto
Task 2: report DONE (commit e3c09c0, 26/26 test verdi, RED->GREEN documentato); task reviewer dispatchato (sonnet) su 142edc9..e3c09c0
Task 2: review 1 — spec ✅, quality Approved (0 Critical, 0 Important)
Task 2: minor (deferred): nessun test copre un host lookalike che *termina* con un dominio ammesso (notyoutube.com, youtube.com.evil.com); il codice e' corretto (Set con uguaglianza esatta) ma una futura "semplificazione" a endsWith passerebbe inosservata
Task 2: minor (deferred): YOUTUBE_HELP_MESSAGE non ha alcun test (gap plan-mandated: manca anche nello scheletro del brief); e' la stringa che vede la redazione quando il build fallisce
Task 2: complete (commits 142edc9..e3c09c0, review clean)
Task 3: dispatched (implementer haiku, BASE e3c09c0) — src/lib/events.ts in TDD stretto
Task 3: report DONE (commit d8933c0, 40/40 test verdi); task reviewer dispatchato (sonnet) su e3c09c0..d8933c0
Task 3: review 1 — spec ✅ ma quality Needs fixes (1 Important: confine di fine evento non asserito)
Task 3: Ruling: rilievo accolto, e' plan-mandated. La lista di test del brief copriva solo punti interni ai due lati del confine live/past, quindi un cambio di <= in < sarebbe passato inosservato — ed e' esattamente il confine che tiene acceso il pulsante di prenotazione su un evento finito. Piano corretto (aggiunti istante esatto di fine, +1ms, stessa verifica per la durata di default, e un caso eventState con endDate malformata) e ricommittato; fix all'implementer. Se sbagliato: quattro test in piu', costo nullo.
Task 3: minor (deferred): il test "just after midnight in Kigali" duplica il lato gia' coperto dal +1s senza aggiungere potere discriminante
Task 3: minor (deferred): isBookable('past', ...) provato solo con 'open' (sufficiente per costruzione, nota di leggibilita')
Task 3: fix round 1/5 rientrato (commit ccbcb86, 44 test; mutation test <= -> < fa fallire 2 nuovi test come atteso)
Task 3: re-review — Finding 1 ADDRESSED, nessuna rottura, events.ts non modificato (fix tests-only come richiesto)
Task 3: complete (commits e3c09c0..ccbcb86, review clean)
Task 4: dispatched (implementer haiku, BASE ccbcb86) — src/lib/images.ts in TDD stretto
Task 4: report DONE (commit eb7b643, 54 test verdi, check e build puliti); task reviewer dispatchato (sonnet) su ccbcb86..eb7b643
Task 4: review 1 — spec ❌ (2 Important, entrambi plan-mandated), quality Approved
Task 4: Ruling: rilievo "UPLOADS_PREFIX duplicato" accolto solo a meta'. La correzione proposta dal revisore (derivare anche il pattern di import.meta.glob dalla costante) romperebbe il build: Vite risolve import.meta.glob per analisi statica e non puo' seguire una variabile o un template string. Deciso: il pattern del glob resta letterale con un commento che spiega perche', e si deriva solo la regex di strip. Se sbagliato: si torna a due letterali, costo nullo — l'alternativa avrebbe rotto il build.
Task 4: Ruling: rilievo "toThrowError deprecato, npm run check emette 2 hint" accolto. Il vincolo "test output pristine" e' vincolante e il brief imponeva la forma deprecata; sostituito con toThrow nel piano. Se sbagliato: nessun costo, toThrow e' l'API corrente.
Task 4: minor (deferred): un path con backslash Windows normalizza in una stringa doppio-prefissata; l'errore viene comunque lanciato (nessun match sbagliato), solo il messaggio all'editor risulta confuso — input implausibile dato che il CMS scrive forward slash
Task 4: minor (deferred): pickImage usa if (!found) invece di un controllo esplicito su undefined
Task 4: fix round 1/5 rientrato (commit d957d65, check 0 hint, build pulito, 54 test)
Task 4: re-review — Finding 1 e 2 ADDRESSED (glob resta letterale, build verde dopo il refactor, check 0/0/0), nessuna rottura
Task 4: complete (commits ccbcb86..d957d65, review clean)
Task 5: dispatched (implementer sonnet, BASE d957d65) — content.config.ts, content-rules.ts (TDD), settings.ts, contenuti di esempio, verifica dei fallimenti di build
Task 5: report DONE (commit 507c442, 57 test, entrambi i fallimenti di build deliberati con messaggi comprensibili; segnalato un quasi-incidente in ripristino, corretto)
Task 5: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); ripristino post-rottura verificato pulito in modo indipendente
Task 5: minor (deferred): nessuno schema usa .strict(), quindi una chiave di frontmatter scritta male viene ignorata in silenzio invece di far fallire il build. Rischio reale basso (il CMS genera le chiavi da form, non a mano) ma e' un buco rispetto all'obiettivo dichiarato della rete di sicurezza — DA TRIAGGIARE NELLA REVIEW FINALE
Task 5: minor (deferred): mapUrl di esempio e' la radice di Google Maps senza place id — valido come URL ma porta a una pagina generica; il Task 18 deve sostituirlo esplicitamente — SUPERATO il 2026-08-23: il campo mapUrl e' stato tolto dall'edizione 2026 e la pagina evento costruisce il link da venue e address, quindi il Task 18 non ha piu' nulla da sostituire
Task 5: minor (carry-forward al Task 6): settings.ts non e' importato da nessuno, quindi siteSettingsSchema.parse(raw) non e' ancora mai stato eseguito in un build reale; il Task 6 e' il primo consumatore e la sua review deve verificarlo
Task 5: complete (commits d957d65..507c442, review clean)
Task 6: dispatched (implementer sonnet, BASE 507c442) — BaseLayout, Header, Footer, seo.ts (TDD), robots.txt
Task 6: report DONE_WITH_CONCERNS (commit 6c8f929, 62 test, check e build puliti, sitemap generata, grep domini terzi negativo)
Task 6: Ruling: accettata la verifica per ispezione (non osservata in browser) di menu mobile e skip link — nessuno strumento di automazione browser disponibile agli agenti, il codice e' deterministico e breve, e il Task 18 Step 9 prevede gia' la prova manuale su Android/iOS/desktop e la navigazione completa da tastiera. Se sbagliato: un difetto di interazione resterebbe scoperto fino alla verifica manuale pre-lancio, che pero' e' obbligatoria prima di pubblicare.
Task 6: task reviewer dispatchato (sonnet) su 507c442..6c8f929
Task 6: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); nav.ts tracciato a mano dal revisore, stato coerente con aria-expanded anche al resize; contrasto rosso TED calcolato (~4.3:1, sopra la soglia 3:1 per testo grande, entrambi gli usi sono wordmark grandi in bold)
Task 6: Ruling: il minor sull'hint di astro check per il blocco JSON-LD viene corretto subito invece che differito, contro la regola generale sui minor. Due motivi: (a) esiste un ruling del Task 4 che impone check 0/0/0, e applicarlo a targhe alterne sarebbe peggio che non averlo; (b) lo stesso pattern JSON-LD ricorre nei Task 10 e 17, quindi differire moltiplicherebbe l'hint su ogni pagina evento e talk invece di tenerlo a uno. Aggiunto is:inline nel piano (3 punti) e nei Global Constraints. Se sbagliato: un attributo in piu' su tre tag, costo nullo.
Task 6: minor (deferred): aria-current usa startsWith senza guardia di confine — nessuna rotta in collisione oggi, ma fragile man mano che arrivano pagine
Task 6: minor (deferred): in nav.ts la variabile `open` significa "era aperto prima del click" ma si legge come "sara' aperto"
Task 5: DIFETTO SCOPERTO A POSTERIORI dal report del Task 6 — astro check emette 4 hint su src/content.config.ts e src/lib/settings.ts: astro/zod e' Zod 4, dove z.string().url() e z.string().email() sono deprecati. Il report del Task 5 dichiarava "0 errori" senza citare gli hint, e la mia richiesta parlava di errori: buco mio nella formulazione, non dell'implementer.
Task 5: Ruling: correggere in z.url() / z.email() nei file del Task 5 e in tutto il piano (ricorre nei Task 15 e 16), coerentemente col ruling "check 0/0/0". Riaperto il Task 5 per la fix. Se sbagliato: si torna alla forma deprecata, che comunque funziona — costo nullo.
Task 6: fix round 1/5 rientrato (commit 0d4045a, hint JSON-LD sparito, JSON-LD ancora presente e valido in dist/index.html)
Task 6: re-review — Finding 1 ADDRESSED (is:inline presente, tag chiuso, JSON-LD ancora valido in dist), nessuna rottura
Task 6: complete (commits 507c442..0219111, review clean)
Task 5: fix riaperta e dispatchata all'implementer originale (hint Zod 4)
Task 5: fix round 1/5 rientrato (commit 7770ea1, check 0/0/0, esperimento bookingUrl non-URL ripetuto: build fallisce con messaggio chiaro, ripristino verificato)
Task 5: re-review — Finding 1 ADDRESSED (4 call site, .optional() preservata su mapUrl e bookingUrl, nessun altro file toccato)
Task 5: complete (commits d957d65..7770ea1, review clean dopo riapertura)
Task 7: Ruling: il piano faceva committare una griglia di talk temporanea in index.astro (Task 7 Step 5) per poi rimuoverla nel Task 8. Cambiato: il banco di prova si usa nel working tree e si annulla con git checkout prima del commit (nuovo Step 6.5), e lo Step 3 del Task 8 diventa una verifica che la home sia rimasta intatta. Motivo: committare impalcature usa e getta sporca la storia e crea un diff di rimozione inutile da rivedere. Se sbagliato: nulla, la verifica manuale avviene comunque.
Task 7: dispatched (implementer sonnet, BASE 7770ea1) — VideoDialog, TalkCard, video-dialog.ts
Task 7: report DONE (commit 732e892, 62 test, check 0/0/0; grep dist: zero iframe nello statico, youtube-nocookie solo nel bundle JS; index.astro non committato)
Task 7: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); facciata verificata strutturalmente, teardown iframe su tutte e tre le vie di chiusura, injection safety confermata (property/textContent, nessuna costruzione di HTML), onerror si auto-annulla
Task 7: ⚠️ del revisore risolto dal controller: il contratto DOM combacia — talk-filters legge data-edition con confronto diretto e data-tags come lista; data-year e' emesso ma nessun filtro lo usa (attributo inerte, annotato come minor)
Task 7: DIFETTO LATENTE TROVATO DAL CONTROLLER: data-tags usava tags.join(' ') e il filtro del Task 17 avrebbe fatto split(' '); un tag legittimo con spazio ("public speaking") avrebbe prodotto token inesistenti facendo sparire il talk dai filtri. Nessun test lo avrebbe visto perche' il filtro non esiste fino al Task 17.
Task 7: Ruling: delimitatore cambiato in '|' nel piano, sia in TalkCard sia nel filtro, con la correzione di TalkCard resa passo obbligatorio del Task 17 (unico task che tocca quella logica). Non riapro il Task 7: nulla legge data-tags prima del Task 17, quindi il codice a disco resta coerente fino ad allora. Se sbagliato: un tag contenente '|' si romperebbe, caso molto meno plausibile di uno spazio.
Task 7: minor (deferred): con cover caricata dalla redazione lo screen reader annuncia sia l'alt sia l'etichetta sr-only (ridondante, non rotto)
Task 7: minor (deferred): preventDefault() nel delegato e' un no-op su un button fuori da form
Task 7: minor (deferred): data-year emesso ma mai letto da alcun filtro
Task 7: complete (commits 7770ea1..732e892, review clean)
Task 8: dispatched (implementer sonnet, BASE 732e892) — pagina /talks con filtri per edizione
Task 8: report DONE (commit 132f179, 62 test, check 0/0/0, valori filtro combacianti; index.astro confermato intatto)
Task 8: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); revisore ha verificato nel preflight di Tailwind v4 che [hidden] con !important batte .flex, quindi nascondere le card funziona davvero
Task 8: minor (deferred): ordinamento a parita' di data e' stabile ma incidentale (ordine di enumerazione della collection), non una chiave scelta
Task 8: minor (deferred): l'ordine dei bottoni edizione dipende dal formato del titolo (anno in fondo); un titolo formattato diversamente li disordinerebbe in silenzio
Task 8: minor (deferred): un talk che referenzia un'edizione assente dalla collection mostra lo slug grezzo come etichetta
Task 8: complete (commits 732e892..132f179, review clean)
Task 9: applicato il ruling CONFLITTO 2 del pre-flight (event-status.ts ora rivela #events-none) e aggiunto lo Step 0 di arricchimento contenuti (edizione 2024 + talk con tag multi-parola come fixture permanente del delimitatore)
Task 9: dispatched (implementer sonnet, BASE 132f179)
Task 9: report DONE (commit 5e449ff, 62 test, check 0/0/0; hand-trace: a evento concluso la card passa in archivio, bottone prenotazione rimosso, #events-none rivelato)
Task 9: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); revisore ha tracciato tutte e tre le transizioni di stato, confermato che booking.remove() e' rimozione DOM e a senso unico, e che prepend/append non possono duplicare o orfanare una card
Task 9: Ruling: il minor sulla costante di durata duplicata viene corretto invece che differito. Il build stampa data-event-end usando DEFAULT_EVENT_DURATION_MS e lo script client aveva un literal copiato a mano: se una delle due cambiasse, la pagina contraddirebbe se stessa su quando un evento finisce — ed e' esattamente il meccanismo di sicurezza per cui questo task esiste. Costo: una riga di import. Se sbagliato: lo script client importa un modulo minuscolo e senza dipendenze, impatto sul bundle trascurabile.
Task 9: fix round 1/5 rientrato (commit e757eea, import risolto nel bundle, data-event-end invariati, check 0/0/0)
Task 9: re-review — Finding 1 ADDRESSED (import risolto e tree-shaken a 144e5 nel bundle client, data-event-end identici)
Task 9: complete (commits 132f179..e757eea, review clean)
Task 10: dispatched (implementer sonnet, BASE e757eea) — pagina evento + EventJsonLd + plugin typography
Task 10: report DONE (commit 19b8d76, 62 test, check 0/0/0, 3 pagine evento generate; JSON-LD 2026 con offers.url = bookingUrl e availability InStock)
Task 10: review 1 — spec ✅ ma quality Needs fixes (2 Important, entrambi plan-mandated); revisore ha validato i dati strutturati contro la documentazione Google effettiva
Task 10: Ruling: rilievo "offers puo' contraddire la pagina" accolto. Un'edizione con iscrizioni chiuse ma bookingUrl residuo nascondeva il bottone e contemporaneamente dichiarava a Google PreOrder disponibile a quell'indirizzo. Offers ora emesso solo se la pagina offre ancora una via di prenotazione, usando lo stesso state; PreOrder eliminato, sold-out mantenuto perche' e' un segnale veritiero. Se sbagliato: si perde il caso "coming-soon con link", che comunque la pagina non mostra.
Task 10: Ruling: price/priceCurrency restano omessi per gli eventi a pagamento. Google li considera raccomandati, non obbligatori: il rich result mostra comunque data e link. Il prezzo vive sulla piattaforma esterna che e' la fonte autorevole; una copia mantenuta a mano da volontari diventerebbe stale, e un prezzo sbagliato nei risultati Google e' peggio di nessun prezzo. Decisione documentata nel codice cosi' da non sembrare una dimenticanza. Se sbagliato: warning ricorrente in Search Console e nessun prezzo nello snippet — DA SEGNALARE ALL'UTENTE.
Task 10: Ruling (minor accolto perche' il file era comunque aperto): organizer.url puntava alla pagina evento invece che al sito dell'organizzazione; ora da Astro.site, e il nome da siteSettings invece che hardcoded.
Task 10: Ruling (hardening non richiesto dai rilievi): introdotto toJsonLd in seo.ts che fa escaping di '<'. Ogni valore nei blocchi JSON-LD e' testo digitato da un redattore: un titolo contenente </script> chiuderebbe il tag in anticipo e romperebbe la pagina. Applicato a EventJsonLd e BaseLayout, e previsto per VideoJsonLd nel Task 17. Motivo: e' esattamente il modello di rischio di questo progetto (sito editato da non tecnici). Se sbagliato: una funzione di tre righe e tre test in piu'.
Task 10: minor (deferred): priceCurrency 'RWF' e' una stringa magica senza fonte unica (unica occorrenza nel codice)
Task 10: fix round 1/5 rientrato (commit 2eb3b69, 65 test, check 0/0/0; injection </script> neutralizzata end-to-end, tree ripristinato)
Task 10: re-review — tutti e 4 i punti ADDRESSED; revisore ha verificato che ogni caso "bottone visibile" e' sottoinsieme stretto di "offer emessa", quindi non esiste combinazione che mostri un bottone senza dato strutturato corrispondente; PreOrder eliminato ovunque
Task 10: complete (commits e757eea..2eb3b69, review clean)
Task 11: dispatched (implementer sonnet, BASE 2eb3b69) — home page
Task 11: report DONE (commit cb91938, 65 test, check 0/0/0; home 51.7 KB non compressi / 10.9 KB gzip, ampiamente sotto il budget di 150 KB)
Task 11: DIFETTO IMPORTANTE — l'implementer lo ha segnalato come non bloccante, io lo classifico come Important. La home ospita una EventCard ma non caricava event-status.ts: scegliendo il "prossimo evento" a build time, un sito non ricostruito per mesi (la norma fra due edizioni) avrebbe continuato a proporre un evento concluso con il pulsante di prenotazione attivo. E' esattamente il fallimento per cui il piano aveva scartato il rebuild programmato, rientrato da un'altra porta.
Task 11: Ruling: event-status.ts viene caricato anche sulla home, e acquisisce una regola generica: ogni sezione marcata [data-event-section] si nasconde quando tutte le sue card sono passate. Cosi' la home non annuncia mai un evento finito come prossimo. Se sbagliato: una sezione in meno sulla home in un caso limite, contro un pulsante di prenotazione ingannevole.
Task 11: fix applicata (commit 424bdda), home 11.5 KB gzip; task reviewer dispatchato su 2eb3b69..424bdda
Task 11: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); revisore ha tracciato lo scenario "build vecchia" nel sorgente: nessun null dereference sulla home, la sezione si nasconde leggendo lo stato aggiornato, /events resta inerte
Task 11: minor (deferred): /about e' linkato ma la pagina nasce nel Task 12 (immediatamente successivo)
Task 11: minor (deferred): la nuova regola di sezione e' O(n*m) — irrilevante ai volumi reali
Task 11: complete (commits 2eb3b69..424bdda, review clean)
Task 12: dispatched (implementer haiku, BASE 424bdda) — about, privacy, 404
Task 12: report DONE (commit f146cf0, 65 test, check 0/0/0, tre pagine generate, 404 noindex confermato)
Task 12: review 1 — spec ❌ (1 Important), quality Needs fixes
Task 12: Ruling: rilievo accolto integralmente, ed e' un difetto del testo che avevo scritto io nel piano. "We do not collect, store or share personal data about visitors" era contraddetto due paragrafi dopo dai log dell'hosting con IP e dal trattamento IP di YouTube al play. L'IP e' dato personale anche secondo la legge 058/2021 citata nella pagina stessa. Riscritto il riassunto: nessun profilo, nessuna vendita o condivisione per pubblicita', e i due caveat dichiarati subito. Se sbagliato: un riassunto piu' lungo di due righe, contro un'affermazione pubblica non veritiera.
Task 12: Ruling (minor accolti, file comunque aperto): "you leave this website" corretto perche' il link di prenotazione apre una nuova scheda; description di About non promette piu' "who runs it", contenuto che la pagina non ha ancora.
Task 12: ⚠️ del revisore portato al Task 18: far verificare da chi ha conoscenza legale locale che la citazione della legge rwandese 058/2021 sia corretta per numero e titolo — DA SEGNALARE ALL'UTENTE
Task 12: fix round 1/5 rientrato (commit 9f11dad, pagina privacy riletta end-to-end)
Task 12: re-review — tutti e 3 i finding ADDRESSED, pagina privacy coerente dall'inizio alla fine, nessuna rottura
Task 12: complete (commits 424bdda..9f11dad, review clean)
Task 13: dispatched (implementer sonnet, BASE 9f11dad) — .pages.yml; verifica nell'interfaccia CMS rimandata al Task 18 (serve il repo su GitHub)
Task 13: report DONE (commit 8423ccc, YAML validato con parser presenti in node_modules, reference field confermato sui doc pagescms.org, cross-check bidirezionale senza disallineamenti; verifica UI CMS correttamente rimandata)
Task 13: review 1 — spec ✅ ma quality Needs fixes (2 Important); revisore ha rifatto il cross-check da zero e verificato sul sorgente di Astro (glob loader + github-slugger) e sui doc pagescms.org che il meccanismo di id fra evento creato dal CMS e reference del talk regge
Task 13: Ruling: accolto "edition senza testo di aiuto". E' il campo che il revisore, l'implementer e il piano stesso indicano come il piu' fragile e confuso per un volontario, ed era l'unico non self-evident senza description. Aggiunta.
Task 13: Ruling: accolto il rilievo sul filename dei talk. I token {year}/{month}/{day} di Pages CMS si risolvono alla data di creazione, non alla data del talk: un talk del 2024 inserito oggi sarebbe stato archiviato come 2026-... Cambiato in '{fields.title}.md'. Un prefisso che sembra la data del talk ma e' la data di inserimento e' peggio di nessun prefisso per chi sfoglia il repo. Se sbagliato: si perde il raggruppamento cronologico per data di inserimento, che nessuno usa.
Task 13: ⚠️ del revisore portato al Task 18: il widget data del CMS potrebbe derivare l'offset dal fuso del browser del redattore. Un volontario che scrive dall'estero, seguendo alla lettera l'istruzione "ora di Kigali", salverebbe l'istante sbagliato. Aggiunta verifica pre-lancio esplicita + testo di aiuto rafforzato.
Task 13: minor accolti (file comunque aperto): aggiunte description a theme e tags
Task 13: fix round 1/5 rientrato (commit 2cdef0d, nessun name: toccato, claim errata corretta nel report)
Task 13: re-review — entrambi i finding e i minor ADDRESSED, nessun name: modificato (parita' con gli schemi preservata), claim errata corretta nel report
Task 13: complete (commits 9f11dad..2cdef0d, review clean)
Task 14: dispatched (implementer sonnet, BASE 2cdef0d) — CI + docs/EDITING.md
Task 14: report DONE (commit 36ec9eb, npm ci/test/build tutti verdi in locale; 8 discrepanze fra guida e .pages.yml reale trovate e risolte a favore della configurazione)
Task 14: review 1 — spec ✅ ma quality Needs fixes (1 Important); revisore ha ri-derivato ogni campo da .pages.yml e confermato tutte e 8 le correzioni dell'implementer, poi ha letto la guida dall'inizio come volontario senza trovare punti di blocco duri
Task 14: Ruling: accolto "lista campi obbligatori incompleta". La guida presenta quattro campi come i required, ma ticketStatus e' required: true e viene introdotto dopo un blocco intitolato "Optional fields". Chi legge quella lista come esaustiva riceve un'informazione falsa sul form. Se sbagliato: una parola in piu' in una lista.
Task 14: minor accolto: il passo del link di prenotazione era incondizionato mentre la sua obbligatorieta' dipende dallo stato biglietti scelto un passo prima
Task 14: CARRY-FORWARD ai Task 15 e 16: EDITING.md dice che foto e loghi richiedono "a short description", ma la convenzione reale usa etichette composte (Cover image description, Image description). Quando i Task 15/16 aggiungono Photo description e Logo description a .pages.yml, quella riga della guida va allineata ai nomi esatti.
Task 14: fix round 1/5 rientrato (commit d0ecab4, 3 finding risolti)
Task 14: re-review — tutti e 3 i finding ADDRESSED, split required/optional veritiero su tutta la sezione eventi, CI non toccata, nessuna deriva delle etichette
Task 14: complete (commits 2cdef0d..d0ecab4, review clean) — FASE 1 COMPLETA
Task 15: dispatched (implementer sonnet, BASE d0ecab4) — collection speakers + pagina /speakers + .pages.yml
Task 15: report DONE (commit 3852a47, 65 test, check 0/0/0, 10 pagine; cross-check CMS/schema bidirezionale ok)
Task 15: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); cross-check CMS/schema ri-derivato dal revisore, fallback foto accessibile, "Watch the talk" degrada a rotte reali in entrambi i casi limite
Task 15: minor (carry-forward al Task 16): EDITING.md dice "three sections" ma con Speakers sono quattro, e il Task 16 ne aggiunge una quinta
Task 15: minor (deferred): tipografia del ruolo in SpeakerCard leggermente diversa da TalkCard (manca font-semibold)
Task 15: minor (deferred): order e' int nello schema ma number nel CMS — un decimale farebbe fallire il build invece di essere arrotondato
Task 15: complete (commits d0ecab4..3852a47, review clean)
Task 16: dispatched (implementer sonnet, BASE 3852a47) — sponsors + /partners + striscia home
Task 16: report DONE (commit 9f86878, 65 test, check 0/0/0, 11 pagine; stato vuoto reso come frase sotto il titolo, non blocco vuoto)
Task 16: review 1 — spec ✅, quality Approved; l'unico Important era una correzione al report, non al codice
Task 16: Ruling: gli avvisi di Astro sulla collection sponsors vuota sono WARN reali (verificati nel sorgente del pacchetto), non info. Accettati come benigni: non fanno fallire CI (che controlla exit code, non output), non toccano il risultato 0/0/0 di astro check, e spariscono appena il team carica il primo sponsor. L'alternativa sarebbe inventare loghi finti, che e' inaccettabile su un sito TEDx reale. Se sbagliato: rumore nel log di build fino al lancio.
Task 16: Ruling: accolto il minor sulla lista dei livelli sponsor ripetuta quattro volte. Stessa classe del ruling sul Task 9 (costante durata duplicata) e stessa precedente di casa (TICKET_STATUSES in lib/events.ts): creata src/lib/sponsors.ts come fonte unica. Il select YAML resta una copia separata, con commento che lo dichiara. Se sbagliato: un file di libreria in piu'.
Task 16: minor accolto: spaziatura dello stato vuoto su /partners allineata a /speakers (mt-8)
Task 16: fix round 1/5 rientrato (commit a0ce342, refactor comportamento invariante, check 0/0/0 su 38 file, report corretto)
Task 16: re-review — tutto ADDRESSED, refactor verificato comportamento-invariante chiave per chiave (etichette e ordine identici), .pages.yml intatto
Task 16: complete (commits 3852a47..a0ce342, review clean)
Task 17: dispatched (implementer sonnet, BASE a0ce342) — VideoJsonLd, filtri per tag, e la correzione del delimitatore dei tag programmata dal Task 7
Task 17: report DONE (commit 146c650, 65 test, check 0/0/0; tag multi-parola dimostrato: public speaking|community filtra, col vecchio delimitatore no)
Task 17: review 1 — spec ✅, quality Approved (0 Critical, 0 Important); revisore ha grepato tutto src/ confermando che TalkCard e' l'unico writer e talk-filters l'unico reader di data-tags, e ha validato la traccia before/after sul fixture reale
Task 17: minor (deferred): un tag che contenesse '|' ricadrebbe nella stessa classe di difetto; lo schema non lo vieta — CANDIDATO A FIX NELLA REVIEW FINALE (un refine sullo schema chiuderebbe la classe in modo permanente)
Task 17: complete (commits a0ce342..146c650, review clean)
=== TUTTI I 17 TASK DI SVILUPPO COMPLETI — avvio review finale whole-branch ===
FINAL REVIEW: 2 Critical + 13 Important + triage dei 24 minor. Verdetto: Needs fixes before handover.
FINAL FIX WAVE: rientrata DONE_WITH_CONCERNS (commit a310b05, 220b5f1, ac9aaa7, 5173ff0, 9baa59b); 96 test (da 65), check 0/0/0, build 11 pagine, tree pulito
FINAL FIX WAVE: due deviazioni segnalate invece che forzate — @fontsource-variable/inter/latin.css non esiste nella 5.3.0 (lasciato com'era, costo per il visitatore nullo grazie a unicode-range); sitemap({trailingSlash}) non e' una chiave valida in 3.7.3, usato trailingSlash: 'never' a livello di progetto, sitemap verificata senza slash
FINAL RE-REVIEW: tutti gli item di Gruppo A, B e C ADDRESSED; A1 e A2 verificati nell'output costruito (il revisore ha letto il chunk minificato di event-status per confermare che il vero eventState sopravvive al bundling); entrambe le deviazioni giudicate corrette; nessun danno strutturale introdotto
FINAL RE-REVIEW: 2 Important residui, entrambi modifiche di una stringa
FINAL: Ruling: applico questi due invece di rinviarli, contro la regola "una sola ondata di fix". Motivo: (a) il messaggio della guardia B12 indica l'unico rimedio sbagliato per il caso che la guida stessa raccomanda — un volontario che lo segue alla lettera riattribuisce pubblicamente un talk all'edizione sbagliata, con build verde; (b) due pagine pubbliche, inclusa la privacy, rendono "Write to us athello@tedxkigali.rw" perche' la compressione HTML mangia lo spazio. Sono due stringhe, rischio nullo, e sarebbero l'ultima cosa che il cliente vede. Se sbagliato: un giro di dispatch in piu'.

---

## Decisioni del committente — 23 agosto 2026

Le due questioni che erano state lasciate aperte perche' non erano nostre da
decidere. Il committente ha visto le opzioni e ha scelto. Nessuna delle due
richiede modifiche: entrambe confermano lo stato attuale.

**Favicon.** Resta il segno a x (barre incrociate a 44 gradi in
`public/favicon.svg`), non il marchio "TEDx" scritto per esteso. Le due opzioni
sono state rasterizzate a 16, 32 e 180 pixel e guardate: a 16 pixel — la
dimensione peggiore, e quella di una scheda su uno schermo non retina — il
marchio scritto e' una macchia illeggibile, mentre la x tiene la forma. A 32
pixel il marchio si legge, minuscola compresa. Scelto il segno perche' una
favicon si sceglie per il caso peggiore.

Va detto con onesta' che questo **non chiude** la segnalazione originale del
committente ("la x dovrebbe essere minuscola"): in un segno isolato il caso
della lettera non e' rappresentabile, come documentato nel commento del file.
Il committente lo sa e ha accettato il compromesso. Non riaprirla.

**Prezzo del biglietto nei dati strutturati.** Resta omesso per gli eventi a
pagamento, confermando il ruling del Task 10 piu' sopra. Il motivo decisivo per
il committente e' la cache di Google: un prezzo cambiato sulla piattaforma di
biglietteria resta vecchio nei risultati di ricerca per giorni, e chi arriva
paga una cifra diversa da quella che ha letto. Il prezzo vive dove viene
incassato. Un evento gratuito continua a dichiarare `price: '0'`, che e' l'unico
caso che non puo' diventare falso.

Se una revisione futura segnala l'assenza del prezzo come lacuna: non lo e', e'
una scelta del committente presa vedendo il compromesso.

## I programmi TEDx (23 agosto 2026)

Il committente ha chiesto di rappresentare le categorie di eventi TEDx: TEDx
Kigali, Women, Youth, Kids e Countdown.

**Struttura: raggruppamento, non filtri.** La prima proposta era una fila di
filtri per categoria. Il committente ha obiettato ("sicuro che abbia senso
cosi'? non ci sono modi migliori?") e aveva ragione. Un filtro risponde a
"mostrami di meno"; la domanda vera di un visitatore davanti a "TEDxKigali
Women" e' "che cos'e'?", e nessuno filtra per una parola che non capisce. Con
tre edizioni e quattro talk, cinque pulsanti in piu' sopra a quelli per edizione
e per argomento sarebbero stati una pulsantiera sopra dieci elementi, e
soprattutto un filtro *nasconde* l'esistenza delle categorie invece di
mostrarla: chi non clicca non scopre mai che i programmi sono cinque.

Quindi: l'archivio degli eventi e i pulsanti della pagina Talks si raggruppano
sotto un titolo per programma, e la pagina About guadagna un blocco "Our
programmes" con una riga di spiegazione ciascuno — che e' l'unica cosa che
rende quei nomi comprensibili, e che nessun filtro puo' dare. Un filtro per
programma si potra' aggiungere quando scorrere sara' diventato il problema; i
dati sono gia' quelli giusti. Anche una pagina per programma resta possibile
senza rifare nulla: il modello dei dati e' lo stesso.

**Tutto e' condizionato a `programmesInOrder(...).length > 1`.** Un sito che
fa solo l'edizione principale non vede ne' titoli ne' blocco About: resta
identico a prima. Ed e' anche una difesa contro l'errore gia' commesso una
volta su questo progetto (accessi in sedia a rotelle promessi su un evento
inventato): un programma compare nella pagina About solo quando ha la sua prima
edizione pubblicata, quindi il sito non puo' annunciare un programma che non e'
mai stato fatto.

**I nomi.** Verificati sulle pagine TED, non dedotti. TED scrive, sulla pagina
degli eventi Youth: *"The word 'Youth' is included at the end of their names
(e.g. TEDx[Your City] Youth). Include a space between the last word of the
location name and the word 'Youth.'"* Quindi `TEDxKigali Youth`, non
`TEDxYouth@Kigali` — la forma con la chiocciola era stata detta al committente
in una risposta precedente ed e' **sbagliata**, e' la convenzione vecchia. Women
e Countdown sono tipi di licenza "named after the location-based community it
serves", quindi stessa forma. Sono in `src/lib/programmes.ts`, campo a scelta
fissa: nessuno li digita.

**"TEDxKigali Kids" non esiste nell'elenco dei tipi di evento di TED.** Il
programma TED per i piu' giovani e' Youth. E' stato incluso perche' e' stato
chiesto, ma prima di pubblicare un evento sotto quel nome chi tiene la licenza
deve confermare che sia un tipo che puo' organizzare. Il sito non puo'
verificarlo. La cautela e' scritta anche in `docs/EDITING.md` e nel commento in
testa a `src/lib/programmes.ts`.

**Due campi non possono chiamarsi entrambi "Programme".** La scaletta della
giornata si chiamava cosi' nel CMS. Ora e' "Programme of the day" e il campo
nuovo e' "TEDx programme"; il titolo stampato sulla pagina dell'evento resta
"Programme".

**Un'edizione di esempio in piu'.** `tedxkigali-women-2025.md` e il talk
collegato esistono solo per far vedere la funzione: senza una seconda edizione
in un programma diverso, nulla di tutto questo si vede. Sono contenuti
inventati come gli altri e vanno via con il resto al lancio — Task 18 del piano
li elenca e spiega che togliendoli i raggruppamenti spariscono da soli, il che
e' il comportamento voluto.
