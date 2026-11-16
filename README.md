# Tractopelle Musik — demo indipendente

Concept non ufficiale, interamente frontend. Next.js App Router, TypeScript, Motion, francese/italiano. Palette, font, struttura, immagini e oggetti 3D conservati.

## Avvio

```bash
npm install
npm run dev
```

Per la presentazione:

```bash
npm run build
npm run start -- --port 3004
```

## Assistente dimostrativo

Tracto AI mostra solo quattro conversazioni predefinite selezionabili: artisti/creatori, marche/partner, Booking di un artista, organizzazione di un evento con Tractopelle. Le risposte successive si esplorano con i pulsanti della conversazione. L’icona di pulizia in alto azzera conversazione e recapiti e torna alla scelta delle demo.

Gli esempi sono fittizi e dichiarati. Non c’è un modello AI collegato, un campo di chat libera, un endpoint AI, una credenziale o una configurazione del provider. L’integrazione precedente e la configurazione locale sono state rimosse. Il brief precede il contatto; il modulo classico resta disponibile e segue il tipo di demo selezionata.

I moduli e i recapiti finali usano solo stato React. Tornare indietro conserva i valori; confermare, pulire o chiudere li cancella. Nessun invio alla label, iscrizione o consegna reale. Solo la lingua è memorizzata in `localStorage`.

## Audio

Gli estratti tentano l’avvio automatico quando entra in vista la sezione Booking. L’icona quadrata Stop è dentro la scheda dell’estratto. Dopo Stop compare Play, che riprende lo stesso brano dal punto interrotto. Non ripartono da soli su hover, focus o rientro nella sezione. Ricaricare la pagina riabilita il comportamento automatico.

Se il browser blocca l’audio non silenziato, la riproduzione viene ritentata alla prima interazione ordinaria con la pagina; la stessa scheda presenta anche l’icona Play. La demo rispetta le restrizioni di autoplay del browser.

## Verifiche

Con la build di produzione su porta 3004:

```bash
npm run typecheck
TEST_URL=http://localhost:3004 node scripts/verify-corrections.mjs
TEST_URL=http://localhost:3004 node scripts/verify-corrections-extra.mjs
TEST_URL=http://localhost:3004 node scripts/verify-audio.mjs
node scripts/verify-client-secrets.mjs
```

Chrome/Playwright: 1440, 768, 390 e 375 px; moduli classici e quattro demo, validazione, ritorno, riepiloghi, conferma locale, Clean, tastiera, scroll, riapertura e assenza di POST. Verifiche aggiuntive a 600 px di altezza, menu, preferenze lingua/movimento e audio strumentato. Nessuna chiamata a un servizio AI.

Report e screenshot correnti in `audit-screenshots/corrections/`; riepilogo in `CORREZIONI.md`. Gli altri audit e script sono storici e possono riferirsi alle versioni precedenti.

Non sono prove su dispositivi fisici o screen reader, né un audit WCAG completo. Lo snapshot editoriale e le immagini esistenti sono stati mantenuti senza una nuova verifica delle fonti o delle licenze.
