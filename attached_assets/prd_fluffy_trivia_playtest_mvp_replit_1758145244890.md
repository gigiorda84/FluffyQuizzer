# PRD – Fluffy Trivia Playtest MVP (Replit)

## 0) Executive Summary

**Obiettivo MVP**: playtesting pubblico per raccogliere insight su difficoltà/divertimento e qualità delle carte.

- **Utente**: giocatore singolo (mobile-first), sessioni rapide.
- **Meccanica**: 4 categorie a quiz (3 opzioni, 1 corretta) + 1 categoria “Speciali” (solo istruzioni).
- **Feedback**: 6 pulsanti rapidi per reazione alla carta + esito (giusto/sbagliato) + tempo di risposta.
- **CMS**: upload `.csv`, CRUD singola carta, analitiche semplici.
- **Brand/UX**: piena aderenza a *Fluffy Trivia.pdf* (colori, tono, layout). Niente semplificazioni estetiche.

---

## 1) Scope & Non‑Goals

**In scope (MVP)**

- App web responsive + PWA installabile (mobile/desktop).
- Flusso “Gioca ora”: selezione categoria o mix; presentazione carta; risposta; feedback; next.
- Registrazione feedback anonimi.
- CMS protetto da login base: upload CSV, lista carte, CRUD, export, semplici analytics.
- Seed iniziale con `domande.csv`.

**Out of scope (MVP)**

- Modalità partita, punteggi, squadre, turni, timer competitivo.
- Multi‑lingua runtime (si prepara lo scheletro i18n, ma contenuti ITA).
- Moderazione avanzata (solo flag “Da rivedere”).

---

## 2) Requisiti Utente

- **Come giocatore** voglio rispondere rapidamente a una carta e sapere subito se ho indovinato.
- **Come giocatore** voglio esprimere un parere sulla carta (divertente, difficile, ecc.).
- **Come editor** voglio caricare/aggiornare carte da CSV e correggere errori singolarmente.
- **Come editor** voglio vedere quali carte funzionano (engagement, correttezza, reazioni) per iterare il contenuto.

**KPI di successo**

- Tasso di completamento carta > 80%.
- ≥ 1 reazione per carta/utente medio.
- ≥ 1000 eventi feedback entro la fase di test.

---

## 3) Contenuti & Categorie

- Le **categorie** sono quelle presenti in `domande.csv`.
- **Colori** per categoria: usare i valori/linee guida presenti in *Fluffy Trivia.pdf* (fedeltà piena).
- **Speciali**: solo testo istruzioni; nessuna risposta.
- **Niente sottocategorie/difficoltà** nel CSV MVP.

---

## 4) CSV – Struttura & Validazione

**Struttura confermata** (header esatti):

```
id, categoria, domanda, risposta1, risposta2, risposta3, corretta, tipo, colore, note
```

- `id`: stringa unica (es. “#AN001”). Se mancante al primo import, verrà autogenerato (`UUID`) ma si consiglia di mantenerlo coerente con i file.
- `categoria`: string matching con palette/brand.
- `corretta`: intero 1–3 (ignorarla per `tipo=speciale`).
- `tipo`: `quiz` | `speciale`.
- `colore`: opzionale; se presente, override del colore di categoria.
- `note`: opzionale (es. spiegazione, curiosità, fonti per copy futuro).

**Regole import**

- **Modalità**: *merge by id* (upsert). Opzione “Sostituisci tutto” disponibile (soft‑delete + re‑import).
- **Validazione**: schema rigido (Zod/Valibot) + report errori (scaricabile .csv) con righe respinte.
- **Sanitizzazione**: trim spazi, gestione emoji/UTF‑8, normalizzazione newline.

**Export**: pulsante “Scarica CSV corrente”.

---

## 5) Modello Dati (Prisma / SQLite)

```prisma
model Card {
  id          String   @id @default(cuid())
  legacyId    String?  @unique  // es. “#AN001” se presente nel CSV
  categoria   String
  colore      String?  // hex opzionale, altrimenti derive da categoria
  tipo        String   // “quiz” | “speciale”
  domanda     String
  risposta1   String?
  risposta2   String?
  risposta3   String?
  corretta    Int?     // 1..3 se tipo=quiz
  note        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isArchived  Boolean  @default(false)
}

model Feedback {
  id          String   @id @default(cuid())
  cardId      String
  reaction    String   // una delle 6 reaction codificate
  correct     Boolean?
  timeMs      Int?
  deviceId    String?  // per antifrode base
  userAgent   String?
  createdAt   DateTime @default(now())
  Card        Card     @relation(fields: [cardId], references: [id])
}

model ImportLog {
  id          String   @id @default(cuid())
  filename    String
  mode        String   // merge | replace
  okCount     Int
  errCount    Int
  reportPath  String?
  createdAt   DateTime @default(now())
}
```

---

## 6) API (Express)

- `GET /api/cards?categoria=&tipo=&limit=&random=1`
- `GET /api/cards/:id`
- `POST /api/feedback` `{ cardId, reaction, correct?, timeMs?, deviceId? }`
- `POST /api/csv/import` (admin, multipart) → valida & importa
- `GET /api/csv/export` (admin) → download csv
- `GET /api/cards` (admin) elenco con query param (search, categoria, tipo, archived)
- `POST /api/cards` (admin) → crea
- `PATCH /api/cards/:id` (admin) → aggiorna
- `DELETE /api/cards/:id` (admin) → soft‑delete (archivia)
- `POST /api/cards/:id/restore` (admin)

**Auth admin**

- MVP: Basic auth su rotte `/api/*` admin + cookie di sessione.

---

## 7) Flussi UX

### 7.1 Giocatore

1. **Home**: seleziona categoria (pill buttons con colori brand) o “Mix”.
2. **Carta**:
   - `tipo=quiz`: mostra domanda + 3 pulsanti risposta (layout e colori fedeli al PDF). On tap → lock, animazione verde/rosso, micro‑copy.
   - `tipo=speciale`: mostra istruzioni + pulsante “Avanti”.
   - Barra inferiore: **6 pulsanti feedback** (reazioni). Tap → toast “Grazie!”.
3. **Next**: auto‑advance (tap ovunque o pulsante “Prossima”).

### 7.2 CMS Editor

- **Login**
- **Cards list**: tabella, ricerca testo, filtri categoria/tipo/stato, pulsanti edit/archivia.
- **Upload CSV**: drag&drop, scelta modalità (merge/replace), anteprima diff, import, report errori.
- **Edit Card**: form coerente con schema; validazioni in‑form.
- **Analytics**: tabelle + grafici base.

---

## 8) Feedback – Reazioni

**Set iniziale (configurabile via env/seed)**

1. 👍 *Mi piace*
2. 👎 *Non mi piace*
3. 😂 *Facile*
4. 🤯 *Difficile*
5. 😴 *Noiosa*
6. 🚩 *Da rivedere*

**Regole**

- Multi‑click consentito ma con rate‑limit (max 1 per reaction per carta/device/ora).
- Salviamo `correct`, `timeMs`, `cardId`, `categoria` (derivata server‑side), timestamp, `deviceId` (hash) e `userAgent`.

---

## 9) Analytics (MVP)

- **Per carta**: n. risposte, % corrette, tempo medio risposta, n. feedback totali, breakdown reazioni.
- **Per categoria**: top/bottom per % corrette; carte più/meno “Divertenti”; carte più “Da rivedere”.
- **Filtri**: intervallo data (Oggi / 7 / 30 / custom), categoria, tipo.
- **Export**: CSV dei feedback grezzi per analisi esterna.

---

## 10) UI/Branding

- **Fedeltà** a *Fluffy Trivia.pdf*: palette, tipografia, iconografia; riprodurre look&feel (rounded, micro‑animazioni playful).
- **Componenti**: pulsanti grandi, hit‑area ≥ 44px, focus states, annunci ARIA.
- **Animazioni**: transizione carta; highlight corretta/errata.

---

## 11) Tecnologie & Struttura Repo (Replit)

- **Monorepo**

```
/apps
  /web   (React + Vite + PWA)
  /api   (Node + Express)
/prisma
  schema.prisma
```

- **DB**: SQLite (file persistente) per MVP. Opzione Postgres (Supabase) in ENV.
- **ORM**: Prisma. **Validation**: Zod.
- **State**: React Query per fetch caching; Zustand (light) per UI state.
- **Build**: Vite + vite‑plugin‑pwa. ESLint + Prettier.
- **Testing**: smoke test e2e Playwright (home → carta → feedback → analytics count > 0).

---

## 12) PWA & Performance

- Installabile (manifest + service worker).
- Cache statici + fallback offline per ultima carta vista (solo demo).
- Lighthouse target: PWA installable, Performance > 85 su mobile.

---

## 13) Privacy & Legal (GDPR‑light)

- Dati anonimi; nessun dato personale.
- Banner informativo + link Policy; possibilità opt‑out tracciamento (disattiva feedback, ma permette gioco).

---

## 14) Accettazione (DoD)

- Import CSV funziona (report errori, merge/replace) e CRUD ok.
- Gioco: ciclo completo domanda → esito → feedback → next.
- Analytics mostrano almeno: n. feedback, % corrette, reazioni per carta.
- PWA installabile e responsive.
- Brand coerente col PDF.

---

## 15) Roadmap (post‑MVP)

- Modalità Partita (punteggio, turni, timer).
- Difficoltà per carta; adaptive routing (spaced repetition/progressivo).
- A/B test copy/ordine risposte.
- Multi‑lingua.
- Auth multi‑ruolo e activity log.

---

## 16) Variabili di Configurazione (ENV)

```
NODE_ENV=production
DATABASE_URL=file:./dev.db
ADMIN_USER=...
ADMIN_PASS=...
FEEDBACK_REACTIONS=like,dislike,lol,hard,boring,review
RATE_LIMIT_WINDOW_MIN=60
RATE_LIMIT_MAX_PER_REACTION=1
```

---

## 17) Open Questions (da confermare)

1. Ordine carte: random globale
2. Timer risposta: necessario? (proposta MVP: no, ma misuriamo `timeMs`).
3. Spiegazione/curiosità: il campo "battuta" viene mostrato post‑risposta
4. Reazioni: confermi esattamente le 6 etichette/emoji e l’ordine?
5. Anti‑abuso: ok a `deviceId` pseudonimo (hash) per rate‑limit?
6. Auth admin: basta Basic auth (+ cookie) o preferisci magic link?

