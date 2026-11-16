> Audit storico di una versione precedente. Per architettura corrente, correzioni e prove aggiornate vedere `CORREZIONI.md`. La demo attuale non contiene un’integrazione AI reale.

# Audit UX — Tractopelle Demo

- **URL**: http://localhost:3000/
- **Data**: 2026-11-16
- **Tool**: Playwright (Chromium headless)
- **Screenshot**: `audit-screenshots/`
- **Codice sorgente app**: non modificato
- **Script usato**: `scripts/ux-audit.mjs` (+ re-audit form mirato)

## Sintesi

| Gravità | Conteggio |
|--------|-----------|
| Critica | 0 |
| Alta | 1 |
| Media | 1 |
| Bassa | 0 |
| **Totale finding** | **2** |

### Runtime / rete (verificati)

| Check | Esito |
|------|--------|
| Overflow orizzontale 1440 / 768 / 390 | Nessuno rilevato |
| Immagini mancanti (naturalWidth=0) | Nessuna |
| Link vuoti (`href="#" / vuoto`) | 0 su 63 controlli |
| Ancore interne rotte | Nessuna tra quelle testate |
| Pageerror JS | Sì — hydration mismatch (vedi finding #1) |
| Console error | Nessuno |
| HTTP ≥400 / requestfailed su asset critici | Nessuno |
| POST form verso host esterni | **0** |
| POST same-origin `/api/assistant` | Presenti (chat AI); server-side può usare OpenAI se configurato |

## Screenshot acquisiti

### Full-page
- `audit-screenshots/fullpage/full-1440.png`
- `audit-screenshots/fullpage/full-768.png`
- `audit-screenshots/fullpage/full-390.png`

### Primo schermo
- `audit-screenshots/viewport/first-screen-1440.png`
- `audit-screenshots/viewport/first-screen-768.png`
- `audit-screenshots/viewport/first-screen-390.png`
- `audit-screenshots/viewport/desktop-1440.png`
- `audit-screenshots/viewport/mobile-390.png`

### Menu / ESC
- `audit-screenshots/modals/mobile-menu-open.png`
- `audit-screenshots/modals/collaboration-after-esc.png`
- `audit-screenshots/modals/booking-after-esc.png`
- `audit-screenshots/modals/demo-after-esc.png`
- `audit-screenshots/modals/community-after-esc.png`

### Flussi moduli
- Artisti: `flows/artists-section.png`
- Collaborazioni AI: `flows/ai-collaborazioni-01-open.png` … `04-has-classic-fallback.png`
- Collaborazioni form: `flows/collaboration-01-open.png`, `…-review.png`, `…-success.png`
- Booking AI + form: `flows/ai-booking-*.png`, `flows/booking-*.png`
- Demo AI + form: `flows/ai-demos-*.png`, `flows/demo-*.png`
- La Liste: `flows/liste-section.png`, `flows/community-*.png`

### Validazione form
- `forms/*-empty-validation.png`
- `forms/*-invalid.png`

---

## Finding UX

### 1. [Alta] Hydration mismatch React all’avvio

- **Area**: Runtime / Header (lang switch) + BookingBeatfield / ArtScene
- **Schermata di riferimento**: `viewport/desktop-1440.png` (rilevato in console pageerror)
- **Gravità**: Alta
- **Comportamento atteso**: HTML SSR e primo render client identici; nessun warning/error di hydration
- **Correzione consigliata**:
  - Allineare lo stato iniziale del language switch (opacity/transform) tra server e client; evitare animazioni Motion con stato diverso al primo paint (`initial` coerente o mount client-only del thumb).
  - Verificare markup di `BookingBeatfield` vs `booking-visual` (il diff di hydration segnala attributi/ruoli diversi tra server e client).
  - Rendere deterministici gli stili iniziali di `art-scene-object` (transform).

### 2. [Media] Persistenza lingua IT non affidabile in sessione di test

- **Area**: i18n / `LanguageProvider`
- **Schermata di riferimento**: flussi form (testi FR nonostante `localStorage.tracto-lang=it`)
- **Gravità**: Media
- **Comportamento atteso**: Dopo selezione IT (o `localStorage`), l’UI resta in italiano al reload
- **Correzione consigliata**: Verificare lettura/scrittura di `tracto-lang` al boot e sincronizzazione di `document.documentElement.lang` prima del paint; evitare race con Motion/hydration sul toggle.

---

## Documentazione fasi moduli

### Artisti
1. Sezione roster visibile — `flows/artists-section.png`
2. Link verso schede ufficiali presenti (13 link rilevati)

### Collaborazioni
1. CTA apre TRACTO AI — `flows/ai-collaborazioni-01-open.png`
2. Scelte rapide / messaggio — `…-02-choices.png`, `…-03-after-choice.png`
3. Fallback «Preferisco il modulo» disponibile — `…-04-has-classic-fallback.png`
4. Form classic: vuoto → errori (6) — `forms/collaboration-empty-validation.png`
5. Dati non validi → errori — `forms/collaboration-invalid.png`
6. Compilazione valida → riepilogo → simulazione OK — `flows/collaboration-review.png`, `…-success.png`
7. ESC chiude la modale — `modals/collaboration-after-esc.png`

### Booking
1. AI open / messaggio — `flows/ai-booking-01-open.png`, `…-03-after-message.png`
2. Classic: vuoto (10 errori), invalid (3), review, success, ESC — screenshot in `forms/` e `flows/booking-*`, `modals/booking-after-esc.png`

### Demo (Artisti & professionisti)
1. AI + scelte — `flows/ai-demos-*.png`
2. Classic multi-step: vuoto (4), invalid, review, success, ESC — `forms/demo-*`, `flows/demo-*`

### La Liste (community)
1. Sezione `#la-liste` — `flows/liste-section.png`
2. CTA `button.text-link` apre FormModal classic
3. Vuoto / email invalida / riepilogo / simulazione completata — `forms/community-*`, `flows/community-review.png`, `flows/community-success.png`
4. ESC chiude — `modals/community-after-esc.png`

---

## Verifiche funzionali richieste

| Requisito | Esito |
|----------|--------|
| Screenshot full-page 1440 / 768 / 390 | OK |
| Screenshot primo schermo desktop/mobile | OK |
| Menu e modali aperti | OK (menu mobile + AI + form) |
| Fasi Artisti / Collaborazioni / Booking / La Liste | Documentate |
| Form vuoti / invalidi / validi demo | OK (errori visibili; successo simulato) |
| Apertura, chiusura, ESC | OK sui form classic e AI testati |
| Navigazione tastiera (Tab) | Esercitata nei form; valori mantenuti nel re-audit |
| Link/pulsanti con azione | Nessun link morto rilevato |
| Overflow / testi tagliati / overlap / immagini | Nessun overflow; nessuna immagine rotta automatica |
| JS errors / rete fallita | Hydration error; nessuna failure rete critica |
| Form demo senza trasmissione esterna | **OK** — 0 POST verso host non locali dai form. Nota: la chat AI usa `POST /api/assistant` (same-origin); con `OPENAI_API_KEY` il server può contattare OpenAI. L’invio “alla label” resta simulato in UI. |

---

## Nota privacy chat AI

Il contatto finale in TRACTO AI e i FormModal classic cancellano i dati in locale e mostrano “simulazione”.  
La fase conversazionale AI può inviare i messaggi a `/api/assistant` (origin-checked). Non è un invio del form “label”, ma è traffico di rete lato server se la chiave OpenAI è presente.

---

## Disclaimer

Audit automatico. Nessuna correzione applicata al codice dell’applicazione in questo passaggio, come richiesto.
