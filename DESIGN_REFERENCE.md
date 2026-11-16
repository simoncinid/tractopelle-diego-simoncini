# TRACTOPELLE — riferimento visivo verificato

Rilevazione: 16 novembre 2026. Fonte: https://tractopellemusic.com/ e pagine `/artistes`, `/demos`, `/la-liste`, `/labels/tractolabel`. Tutte accessibili e osservate con Chrome/Playwright a 1440 × 1000 e 390 × 844. Screenshot integrali in `screenshots/original/` (10 file). HTML/CSS originali e stili computati in `research/`. Non sono valori dedotti a occhio.

## Colori e sfondi

Token CSS originali: `--nuit: #050507`, `--nuit2: #0b0b10`, `--nuit3: #14141c`, `--vif: #ccff00`, `--vif-d: #a8d400`, `--chaud: #ff2d6f`, bianco `#ffffff`. Testi secondari bianchi al 60%, terziari al 34%; bordi al 9% e 16%. Nessuna texture fotografica di sfondo.

L'aurora della hero è effettivamente presente: quattro gradienti radiali verde rgba(204,255,0,.15) al 6%/44%, viola rgba(122,58,255,.34) al 76%/16%, rosa rgba(255,45,111,.22) al 98%/66%, blu rgba(0,148,255,.13) al 50%/96%. Formula completa conservata in `styles/design-tokens.css`.

## Tipografia

Archivo variabile (100–900, normal) per interfaccia e titoli, IBM Plex Mono (400/500/600 nel sito) per etichette. File WOFF2 Latin copiati dal riferimento e serviti localmente; nella demo IBM Plex Mono usa il peso 400. Nessun servizio font esterno.

Titolo home: `clamp(1.85rem,5.9vw,4.6rem)`, peso 900, line-height .93, tracking -.045em, maiuscolo; a 1440px: 73.6px / 68.448px. Titoli delle altre pagine: `.mega` fino a 80px, .95, 900; La Liste arriva a 104px. Sezioni: 33.6px, peso 800, maiuscolo. Corpo: 16px / 24.8px; descrizioni 15–17px / 1.6. Etichette mono 10.5px con tracking .12em.

## Composizione

Layout fluido, nessun max-width globale rilevato. Margini `clamp(1.1rem,4.5vw,3.6rem)` (57.6px a 1440px). Navigazione alta 64px. Hero originale padding 168px 57.6px 72px: titolo a sinistra, molto spazio libero e aurora a destra. Testo descrittivo contenuto (48ch), CTA in linea; niente fotografia stock. Sezioni con padding verticale fino a 73.6px e separatori discreti.

Header: logo piccolo quadrato arrotondato a sinistra, nome in Archivo e MONACO in microtipografia, link grigi, CTA verde a destra. Responsive: margini 17.6px, moduli su una colonna e caroselli orizzontali. Nella cattura mobile il riferimento mantiene una navigazione compressa/tagliata in alto, senza un menu espandibile visibile: la demo corregge questo limite introducendo un menu accessibile. Footer: grande “MONACO ONLY MUSIC LABEL” su due righe, quattro colonne su desktop; nella home mobile acquisita i gruppi risultano impilati. La demo dispone i gruppi in due colonne su mobile per contenere la lunghezza.

## Schede e interazioni

Pulsanti pillola, padding .95rem 1.55rem, peso 700, verde e nero; secondari bianchi trasparenti con bordo al 16%. Hover: traslazione -2px e ombra verde; rispetto di reduced-motion. Focus outline 2px verde.

Pagina artisti: quattro colonne desktop, ritratti verticali, radius 16px, bordo sottile, nomi bianchi in basso su gradiente nero. Home originale: carosello di ritratti circolari; nella cattura originale alcuni ritratti home rimangono vuoti, mentre la pagina artisti li carica correttamente. La demo usa la variante verticale già verificata nella pagina artisti.

Copertine quadrate con radius 16px; carosello orizzontale originale. Demo: griglia consultabile, quattro uscite. Moduli originali su pannelli #0b0b10 con input #14141c, radius contenuto e ruoli a pillole. Nessun effetto 3D. Animazioni brevi di ingresso, transizioni hover. Le schermate originali sono state acquisite dopo scorrimento di tutta la pagina.

## Contenuti e asset

Nomi e link profili verificati nell'elenco ufficiale; nessuna biografia, statistica o disponibilità inventata. Copertine, logo e ritratti provengono esclusivamente dagli asset serviti sul sito ufficiale, non da ricerche casuali. Provenienza dettagliata in `public/assets/SOURCES.md`. Asset usati come riferimenti nella proposta locale indipendente; non è stata verificata una licenza di ripubblicazione. Prima di un uso pubblico occorre sostituirli o ottenere l'autorizzazione appropriata.

La Liste ufficiale mostra “Rien d'ouvert en ce moment”: mantenuto stato neutro. Nuovi percorsi commerciali e copy sono proposte dimostrative, non servizi annunciati dal team. Moduli esclusivamente locali, nessuna promessa di ricezione.

## Scelte di evoluzione, distinte dall'originale

Hero con lo stesso carattere tipografico, verde e aurora, ma testo richiesto dal brief. Quattro percorsi equivalenti; artisti in sei colonne a desktop per mostrare la selezione; sezioni commerciali in pannelli editoriali. I numeri 01–04 sono indici di navigazione, non metriche. Le nuove sezioni e le modali non esistono nel riferimento: sono progettate con i suoi token.

## Limiti della verifica

Verificati CSS, schermate desktop/mobile e contenuti pubblici delle cinque pagine richieste. Non verificate licenze degli asset, processi interni, ricezione dei form originali, aree riservate, disponibilità degli artisti e calendario futuro. Nessun modulo ufficiale è stato inviato. Non è stata condotta un'analisi completa di ogni animazione originale o di tutti i browser/dispositivi fisici.

## Evoluzione 3D richiesta il 16 novembre 2026

Su richiesta successiva dell'utente, la proposta introduce un linguaggio più futuristico: tre sculture musicali CGI originali generate con il tool integrato image_gen, in nero #050507, cromo e verde #ccff00, con riflessi viola coerenti con l'aurora originale. Non sono asset ufficiali né fotografie di strumenti/partner reali.

- Hero: `public/assets/generated/sonic-orbit.webp`, vinile orbitale.
- Collaborazioni: `public/assets/generated/collaboration-knot.webp`, intreccio di due universi.
- Booking: `public/assets/generated/live-microphone.webp`, microfono e orbita sonora.

Prompt completi e metodo: `research/imagegen/prompts.json`. WebP 1000 × 1000, circa 348 KB complessivi. Immagini decorative con alt vuoto e dimensioni riservate, lazy loading per le sezioni successive alla hero. Originali PNG conservati nell'archivio di image_gen.

Le nuove interazioni includono prospettiva delle sculture al puntatore, riflessi e lieve inclinazione delle schede, spotlight sulle aree commerciali e sui percorsi, sheen delle CTA e ingressi progressivi allo scroll. Un solo listener delegato aggiorna le variabili CSS tramite requestAnimationFrame. Su touch non sono necessarie interazioni hover; prefers-reduced-motion disattiva parallasse, ingressi e sheen.

Questa evoluzione modifica intenzionalmente l'approccio iniziale più fedele al riferimento, in base alla nuova richiesta. Le traduzioni italiano/francese esistenti sono preservate.

### Ingressi al caricamento e allo scroll

Ulteriore richiesta dell'utente: la hero ora presenta le tre righe tramite maschera verticale e sfocatura breve, con ritardi di 120/240/360 ms. La scultura entra con rotazione e scala, seguita da descrizione e CTA. Nessun caricamento artificiale o schermata che blocca la pagina.

Durante lo scroll un singolo IntersectionObserver osserva separatamente titoli, schede, sculture e contenuti del footer. Gli ingressi usano traslazione verticale, dissolvenza e sfocatura; le schede hanno ritardi di 85 ms, ridotti a gruppi di due su mobile. Ogni elemento si anima una sola volta. I contenuti rimangono presenti senza JavaScript; il focus rende immediatamente visibili gli elementi e il cambio di prefers-reduced-motion ripristina tutti i contenuti senza attesa.

Verifica dedicata: `node scripts/verify-entrances.mjs`, con server locale su 3002, oppure variabile `TEST_URL`. Screenshot prima/dopo e report in `screenshots/entrances/`.

## Tracto AI — evoluzione richiesta dall'utente

L'assistente sostituisce l'apertura iniziale dei moduli creativi/commerciali/booking, con alternativa al modulo originale. Interfaccia con orbita in CSS, stato di elaborazione reale, brevi suggerimenti contestuali e brief progressivo. Italiano e francese sono preservati.

La richiesta successiva autorizza un endpoint server e la chiamata reale a OpenAI, superando il vincolo iniziale frontend-only per questa sola funzione. I messaggi della chat sono trasmessi a OpenAI; nome/email del contatto finale restano nello stato React e la consegna al label è esclusivamente simulata. Il footer e le note dell'assistente indicano questa distinzione. Nessuna chiave è presente negli asset pubblici o nel bundle client.

Modello configurabile, predefinito GPT-4.1 mini, Responses API con Structured Outputs, store:false, contesto limitato e nessuna navigazione o azione esterna. Il modello qualifica il progetto raccogliendo fatti, non assegna giudizi di merito artistico. Nessuna consegna o disponibilità è inventata. Verifiche reali e screenshot in `screenshots/assistant/`.
