# Revisione correttiva Tractopelle

16 novembre 2026. Stato corrente aggiornato alle richieste successive: solo quattro conversazioni dimostrative; audio automatico con Stop/Play e ripresa dal punto interrotto. Gli stili modificati dall’utente durante la sessione sono stati mantenuti. Palette, font, struttura principale, immagini e oggetti 3D non sono stati rifatti.

## Runtime e finestre

- Il precedente audit conteneva un hydration mismatch: la preferenza di movimento ridotto produceva markup/stili diversi tra SSR e primo rendering nel browser. `lib/useReducedMotion.ts` usa uno snapshot iniziale coerente con il server, poi aggiorna la preferenza. Applicato a lingua, elementi decorativi e Booking.
- Rimossa la dipendenza della struttura iniziale del beatfield dalla preferenza di movimento. Il canvas resta nel markup; l’effetto rispetta la preferenza.
- `lib/dialog.ts` contiene la gestione del ciclo Tab/Shift+Tab; ESC chiude i dialoghi. Il focus ritorna al comando di apertura, anche dopo il passaggio al modulo classico.
- `lib/scrollLock.ts` coordina il blocco dello scroll tra menu, assistente e moduli. Corretto il caso menu mobile → assistente → chiusura, che poteva lasciare `overflow: hidden` sul body.
- I moduli classici hanno scroll interno e riepiloghi che gestiscono stringhe lunghe. L’assistente usa gli scorrimenti della composizione corrente, inclusi gli adattamenti agli stili effettuati dall’utente.
- I contenitori interattivi non cambiano posizione quando ricevono focus durante il clic: l’animazione di ingresso poteva spostare una CTA tra pointerdown e pointerup, annullando il primo clic.

## Moduli e testi

- Date di uscita e date nei riepiloghi localizzate con `Intl.DateTimeFormat`; budget nei riepiloghi formattati in euro.
- Campi numerici controllati: lettere, notazione esponenziale e segni arbitrari non entrano nel valore. La validazione richiede numeri interi positivi. Mantenuta la validazione email esistente.
- Booking: budget, capienza e data non obbligatori al primo contatto; anche la struttura organizzatrice è facoltativa. Disponibili indicazioni “Je ne sais pas encore” e scelta dell’artista ancora da definire.
- Nel percorso artistico la città è facoltativa. Il periodo della collaborazione è facoltativo. Rimossa la configurazione duplicata e inutilizzata dei moduli da `mockData.ts`.
- I valori restano disponibili tornando indietro o modificando il riepilogo. Conferma locale e chiusura li eliminano; nessuna consegna o iscrizione reale.
- Copy francese aggiornato secondo il testo fornito: hero, quattro ingressi, collaborazioni, Booking, artisti e La Liste. Aggiornata anche la traduzione italiana; rimossi riferimenti a formule live o disponibilità non confermate.
- Francese come lingua iniziale, mantenendo la preferenza italiana salvata.

## Tracto AI: solo presentazione locale

L’architettura iniziale comprendeva una route server che inoltrava la cronologia a un provider. Questa integrazione è stata **rimossa**, non soltanto disabilitata.

- Eliminati il route handler, il parser/schema delle risposte del provider, la chat libera, la modalità AI reale e il relativo vecchio script di verifica.
- Rimossi la chiave e i parametri del provider dalla configurazione locale; eliminati i file di configurazione rimasti vuoti. Riavviato il server di sviluppo senza la precedente configurazione.
- La build corrente espone soltanto pagine statiche; il precedente endpoint non esiste.
- `data/assistantDemos.ts` contiene quattro conversazioni fittizie: Artisti & creatori, Marche & partner, Booking artista, Evento con Tractopelle.
- Ogni conversazione avanza con risposte dimostrative selezionabili. Le domande sono brevi, una alla volta. Il brief compare prima dei recapiti, senza promettere ascolti, selezione, accordi o disponibilità.
- Il pulsante con icona di pulizia cancella scenario, messaggi, brief e recapiti, poi mostra nuovamente le quattro scelte. Il modulo classico segue il percorso dello scenario selezionato.
- Nome, email e brief modificato restano solo nello stato del componente; nessun POST o servizio AI è necessario.

## Audio

- Ripristinato il tentativo di avvio automatico entrando nella sezione Booking, secondo la richiesta aggiornata.
- Comando quadrato Stop dentro la scheda con waveform e durata, nella posizione indicata dal riferimento.
- Stop mette in pausa senza cambiare sorgente o azzerare `currentTime`; la scheda resta visibile e mostra Play. Play riprende lo stesso estratto dallo stesso punto.
- Waveform e beatfield si fermano durante la pausa. Hover, focus e uscita/rientro nella sezione non annullano la scelta dell’utente.
- Se il browser blocca l’autoplay non silenziato, compare Play e la riproduzione può essere ritentata alla normale interazione con la pagina. Non è possibile ignorare le restrizioni del browser.

## Verifiche e prove

Esito finale: build e TypeScript superati; tutti i gruppi della matrice principale e delle verifiche aggiuntive superati. Nessun errore JavaScript o di console nelle prove correnti, nessun POST dai moduli o dalle demo. Verificato anche il media element reale per pausa e ripresa della stessa sorgente. Riepilogo della build verificata: `audit-screenshots/corrections/final-summary.json`.

Gli esiti dell’ultima esecuzione sono nei report JSON di `audit-screenshots/corrections/`; un eventuale campo `failure` indica un controllo non superato. Gli screenshot precedenti nella stessa cartella possono documentare passaggi intermedi; quelli dei report correnti seguono la versione descritta qui.

| Controllo | Comando / prova |
| --- | --- |
| TypeScript | `npm run typecheck` |
| Build di produzione | `npm run build` — nessuna route AI nella tabella delle route |
| Moduli e quattro demo a 1440, 768, 390, 375 px | `scripts/verify-corrections.mjs` → `verification.json` |
| Clean, viewport alti 600 px, menu, ingressi, preferenze, assenza di POST | `scripts/verify-corrections-extra.mjs` → `extra-verification.json` |
| Audio reale: avvio, pausa, ripresa e stessa sorgente | `scripts/verify-audio.mjs` → `audio-verification.json` |
| Assenza di credenziali negli asset pubblici e configurazione locale rimossa | `scripts/verify-client-secrets.mjs` → `client-secrets.json` |
| Sviluppo, entrambe le preferenze di movimento | `development-verification.json` |

La prova audio reale avvia Chrome con autoplay esplicitamente consentito per verificare il comportamento del media element. La verifica aggiuntiva strumenta `play/pause` per osservare chiamate, tempo conservato e assenza di riavvio automatico. Non è una valutazione della qualità sonora.

Le prove coprono compilazione dei moduli, campi vuoti, email e URL non validi, data passata, campi numerici, navigazione indietro, conservazione dei valori, riepiloghi, conferme locali, chiusura/riapertura, tastiera e controlli visibili raggiungibili. I controlli rispettano la visibilità dei titoli e degli indicatori scelta dall’utente negli stili mobili.

Non sono stati eseguiti test su dispositivi fisici, Safari/Firefox, screen reader o un audit WCAG completo. Nessuna verifica tramite provider AI: il collegamento è stato rimosso. Le informazioni editoriali e le licenze delle immagini non sono state nuovamente verificate. Il repository di lavoro non contiene una directory Git, quindi non è stato creato un commit.
