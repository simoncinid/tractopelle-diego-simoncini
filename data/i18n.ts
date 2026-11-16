import { artists, type FormKind, type Field } from '@/data/mockData';

export type Lang = 'fr' | 'it';

const artistOptions = artists.map((a) => a.name);

type FormCopy = { title: string; intro: string; fields: Field[] };

export type Dictionary = {
  meta: { title: string; description: string };
  skip: string;
  nav: [string, string][];
  headerCta: string;
  openMenu: string;
  closeMenu: string;
  mobileNav: string;
  mainNav: string;
  demoNote: string;
  hero: {
    pill: string;
    h1a: string;
    h1b: string;
    h1c: string;
    p1: string;
    p2: string;
    ctaArtists: string;
    ctaWork: string;
    scroll: string;
    cap1: string;
    cap2: string;
  };
  paths: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { number: string; title: string; text: string; cta: string; href?: string; kind?: FormKind }[];
  };
  artists: {
    eyebrow: string;
    title: string;
    all: string;
    discover: string;
    discoverAria: (name: string) => string;
    caption: string;
  };
  releases: {
    eyebrow: string;
    title: string;
    all: string;
    coverAlt: (title: string) => string;
    cardAria: (title: string) => string;
    bottom: string;
    spotify: string;
    types: Record<string, string>;
  };
  collab: {
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    p1: string;
    p2: string;
    cta: string;
    visual: string;
    tags: string[];
  };
  booking: {
    visualEyebrow: string;
    eyebrow: string;
    title: string;
    p1: string;
    p2: string;
    cta: string;
    note: string;
  };
  demos: {
    eyebrow: string;
    titleBefore: string;
    titleAccent: string;
    p1: string;
    p2: string;
    roles: string[];
    steps: string[];
    cta: string;
  };
  community: {
    eyebrow: string;
    title: string;
    lead: string;
    items: string[];
    status: string;
    bottom: string;
    cta: string;
  };
  footer: {
    backTop: string;
    colLabel: string[];
    links: string[];
    local: string;
    brand: string;
    disclaimer: string;
    privacy: string;
  };
  modal: {
    eyebrow: string;
    close: string;
    successTitle: string;
    successIntro: string;
    successMuted: string;
    successCta: string;
    reviewTitle: string;
    demoNote: string;
    steps: string[];
    stepsAria: string;
    empty: string;
    optional: string;
    choose: string;
    required: string;
    back: string;
    continue: string;
    review: string;
    edit: string;
    confirm: string;
    errors: {
      required: string;
      email: string;
      url: string;
      number: string;
      date: string;
    };
  };
  forms: Record<FormKind, FormCopy>;
};

export const dictionaries: Record<Lang, Dictionary> = {
  fr: {
    meta: {
      title: 'Tractopelle Musik — Monaco Only Music Label · Concept',
      description:
        'Concept indépendant : artistes, musique, collaborations et projets. Démonstration frontend non officielle.',
    },
    skip: 'Aller au contenu',
    nav: [
      ['Accueil', 'accueil'],
      ['Artistes', 'artistes'],
      ['Musique', 'musique'],
      ['Collaborations', 'collaborations'],
      ['Booking', 'booking'],
      ['Démos', 'demos'],
    ],
    headerCta: 'Présenter un projet',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    mobileNav: 'Navigation mobile',
    mainNav: 'Navigation principale',
    demoNote: 'Concept indépendant · Démonstration non officielle',
    hero: {
      pill: 'Monaco Only Music Label',
      h1a: 'Spotify sert à écouter.',
      h1b: 'TikTok sert à découvrir.',
      h1c: 'Ici, on entre.',
      p1: 'Tractopelle Musik. Des artistes, des sorties, des clips.',
      p2: 'Et une porte ouverte aux projets qui ont quelque chose à apporter.',
      ctaArtists: 'Écouter le son',
      ctaWork: 'Proposer un projet',
      scroll: 'À CHACUN SON ENTRÉE',
      cap1: 'MONACO, LA MUSIQUE EN COMMUN.',
      cap2: 'LABEL INDÉPENDANT / CULTURE COLLECTIVE',
    },
    paths: {
      eyebrow: 'L’UNIVERS TRACTOPELLE',
      title: 'T’es là pour quoi ?',
      lead: 'Le son, un projet, une collab ou une date.',
      items: [
        {
          number: '01',
          title: 'Fans',
          text: 'Les artistes. Les morceaux. Les clips.',
          cta: 'Voir le son',
          href: '#musique',
        },
        {
          number: '02',
          title: 'Artistes & créateurs',
          text: 'Pas besoin d’un long discours. Fais écouter ce que tu fais.',
          cta: 'Présenter un projet',
          kind: 'demo',
        },
        {
          number: '03',
          title: 'Marques & partenaires',
          text: 'Une campagne, une licence, une idée avec un artiste ? Parle-nous du projet.',
          cta: 'Proposer une collaboration',
          kind: 'collaboration',
        },
        {
          number: '04',
          title: 'Booking & événements',
          text: 'Une scène. Une date. Un budget, même à définir. On en parle.',
          cta: 'Demander un booking',
          kind: 'booking',
        },
      ],
    },
    artists: {
      eyebrow: 'DES VOIX. DES UNIVERS.',
      title: 'Les artistes.',
      all: 'Tous les artistes',
      discover: 'Découvrir',
      discoverAria: (name) => `Découvrir ${name} sur le site officiel (nouvel onglet)`,
      caption: 'Une sélection du roster officiel. Les profils s’ouvrent sur tractopellemusic.com.',
    },
    releases: {
      eyebrow: 'LE SON AVANT TOUT',
      title: 'Dernières sorties.',
      all: 'Tout le catalogue',
      coverAlt: (title) => `Pochette ${title}`,
      cardAria: (title) => `${title} — fiche officielle (nouvel onglet)`,
      bottom: 'Les sorties et les profils sont à retrouver sur les pages officielles.',
      spotify: 'Écouter sur Spotify',
      types: { Single: 'Single', Compilation: 'Compilation', EP: 'EP' },
    },
    collab: {
      eyebrow: 'MARQUES & PARTENAIRES',
      titleBefore: 'Une idée, c’est bien.\nUn projet concret, ',
      titleAccent: 'c’est mieux.',
      p1: 'Marques, agences, producteurs : dites-nous ce que vous préparez,',
      p2: 'avec qui et pour quand.',
      cta: 'Proposer une collaboration',
      visual: 'VOTRE UNIVERS × NOTRE MUSIQUE',
      tags: ['Partenariats de marque', 'Licences musicales', 'Campagnes & création', 'Projets audiovisuels'],
    },
    booking: {
      visualEyebrow: 'DU SON À LA SCÈNE',
      eyebrow: 'BOOKING & ÉVÉNEMENTS',
      title: 'Vous avez la scène.\nParlons du show.',
      p1: 'Festivals, concerts, événements privés et productions live.',
      p2: 'Faire venir Tractopelle, ce n’est pas le show d’un seul artiste : MC Pao, d’autres artistes du label, des DJ et toute une crew montent sur scène pour transformer la soirée en party. Un nouveau modèle live — collectif, immersif, haute énergie.',
      cta: 'Faire une demande',
      note: 'Une proposition de date, sans engagement de disponibilité. Budget et capacité peuvent rester à préciser.',
    },
    demos: {
      eyebrow: 'ARTISTES & PROFESSIONNELS',
      titleBefore: 'T’as un projet ?\nFais-le ',
      titleAccent: 'écouter.',
      p1: 'Artiste, beatmaker, auteur, clippeur ou manager :',
      p2: 'partage ton travail et explique ce que tu cherches.',
      roles: ['Artiste', 'Manager', 'Clippeur', 'Topliner', 'Auteur', 'Producteur'],
      steps: ['01 Profil', '02 Projet', '03 Récapitulatif'],
      cta: 'Envoyer ton projet',
    },
    community: {
      eyebrow: 'LA LISTE · LA COMMUNAUTÉ',
      title: 'Pas d’ouverture en ce moment.\nLa suite arrive ici.',
      lead: 'Écoutes privées, avant-premières,\nexpériences.',
      items: ['Écoutes privées', 'Avant-premières', 'Événements & expériences'],
      status: 'Aucune ouverture annoncée',
      bottom: 'Rien d’ouvert en ce moment. Restons à l’écoute.',
      cta: 'Consulter la Liste',
    },
    footer: {
      backTop: 'Retour en haut',
      colLabel: ['LE LABEL', 'FAISONS ÉQUIPE', 'RESTONS CONNECTÉS', 'LA COMMUNAUTÉ'],
      links: ['Les artistes', 'La musique', 'Collaborations', 'Booking', 'Présenter un projet', 'La Liste', 'Les prochaines ouvertures'],
      local: 'Monaco, MC',
      brand: 'TRACTOPELLE MUSIK',
      disclaimer: 'Concept indépendant · Démonstration frontend non officielle',
      privacy: 'Conversations de démonstration · Aucune IA connectée · Aucun envoi au label.',
    },
    modal: {
      eyebrow: 'TRACTOPELLE · DÉMONSTRATION',
      close: 'Fermer la fenêtre',
      successTitle: 'Simulation terminée.',
      successIntro: 'Démonstration : votre demande a été simulée. Aucune information n’a été transmise.',
      successMuted: 'Les informations saisies ont été effacées.',
      successCta: 'Revenir au site',
      reviewTitle: 'Votre récapitulatif.',
      demoNote: 'Formulaire de démonstration. Aucun envoi, aucun stockage.',
      steps: ['Votre profil', 'Votre projet', 'Récapitulatif'],
      stepsAria: 'Étapes du projet',
      empty: 'Non renseigné',
      optional: ' (facultatif)',
      choose: 'Choisir…',
      required: '* Champs obligatoires',
      back: 'Retour',
      continue: 'Continuer',
      review: 'Voir le récapitulatif',
      edit: 'Modifier',
      confirm: 'Confirmer la simulation',
      errors: {
        required: 'Veuillez renseigner ce champ.',
        email: 'Saisissez une adresse email valide.',
        url: 'Ajoutez un lien complet commençant par https://.',
        number: 'Indiquez un nombre entier supérieur à zéro.',
        date: 'Choisissez une date à venir.',
      },
    },
    forms: {
      collaboration: {
        title: 'Présentez le projet.',
        intro: 'Présentez les contours de votre collaboration.',
        fields: [
          { name: 'company', label: 'Nom de l’entreprise' },
          { name: 'contact', label: 'Nom du contact' },
          { name: 'email', label: 'Email professionnel', type: 'email' },
          {
            name: 'type',
            label: 'Type de collaboration',
            options: [
              'Partenariat de marque',
              'Placement de produit',
              'Campagne digitale',
              'Licence musicale',
              'Projet audiovisuel',
              'Autre collaboration',
            ],
          },
          { name: 'artist', label: 'Artiste concerné', options: artistOptions, optional: true },
          { name: 'budget', label: 'Budget envisagé (€)', type: 'number', optional: true, placeholder: 'Je ne sais pas encore' },
          { name: 'period', label: 'Date ou période du projet', optional: true, placeholder: 'Ex. printemps 2027', wide: true },
          { name: 'description', label: 'Description du projet', type: 'textarea', wide: true },
        ],
      },
      booking: {
        title: 'Proposez une date.',
        intro: 'Une proposition de date, sans engagement de disponibilité.',
        fields: [
          { name: 'organizer', label: 'Nom de l’organisateur' },
          { name: 'company', label: 'Entreprise ou structure', optional: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'city', label: 'Ville' },
          { name: 'country', label: 'Pays' },
          {
            name: 'type',
            label: 'Type d’événement',
            options: ['Concert', 'Festival', 'Événement privé', 'Production live', 'Autre événement'],
          },
          { name: 'date', label: 'Date souhaitée', type: 'date', optional: true },
          { name: 'artist', label: 'Artiste demandé', options: [...artistOptions, 'Je ne sais pas encore'] },
          { name: 'capacity', label: 'Capacité estimée du lieu', type: 'number', optional: true, placeholder: 'Je ne sais pas encore' },
          { name: 'budget', label: 'Budget indicatif (€)', type: 'number', optional: true, placeholder: 'Je ne sais pas encore' },
          { name: 'description', label: 'Informations complémentaires', type: 'textarea', optional: true, wide: true },
        ],
      },
      demo: {
        title: 'Fais écouter ton projet.',
        intro: 'Artistes et professionnels : racontez-nous ce que vous faites.',
        fields: [
          { name: 'name', label: 'Nom ou blaze', stage: 0 },
          { name: 'email', label: 'Email', type: 'email', stage: 0 },
          {
            name: 'role',
            label: 'Rôle',
            options: ['Artiste', 'Beatmaker', 'Manager', 'Clippeur', 'Topliner', 'Auteur', 'Producteur', 'Autre profil'],
            stage: 0,
          },
          { name: 'city', label: 'Ville', stage: 0, optional: true },
          { name: 'url', label: 'Lien vers le projet', type: 'url', placeholder: 'https://…', stage: 1, wide: true },
          { name: 'description', label: 'Présentation courte', type: 'textarea', stage: 1, wide: true },
        ],
      },
      community: {
        title: 'Consulter la Liste.',
        intro: 'Aucune ouverture annoncée. Testez le formulaire sans inscription réelle.',
        fields: [{ name: 'email', label: 'Votre adresse email', type: 'email', wide: true }],
      },
    },
  },
  it: {
    meta: {
      title: 'Tractopelle Musik — Monaco Only Music Label · Concept',
      description:
        'Concept indipendente: artisti, musica, collaborazioni e progetti. Demo frontend non ufficiale.',
    },
    skip: 'Vai al contenuto',
    nav: [
      ['Home', 'accueil'],
      ['Artisti', 'artistes'],
      ['Musica', 'musique'],
      ['Collaborazioni', 'collaborations'],
      ['Booking', 'booking'],
      ['Demo', 'demos'],
    ],
    headerCta: 'Presenta un progetto',
    openMenu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    mobileNav: 'Navigazione mobile',
    mainNav: 'Navigazione principale',
    demoNote: 'Concept indipendente · Demo non ufficiale',
    hero: {
      pill: 'Monaco Only Music Label',
      h1a: 'Spotify serve ad ascoltare.',
      h1b: 'TikTok serve a scoprire.',
      h1c: 'Qui si entra.',
      p1: 'Tractopelle Musik. Artisti, uscite, video.',
      p2: 'E spazio per i progetti che hanno qualcosa da portare.',
      ctaArtists: 'Ascolta la musica',
      ctaWork: 'Proponi un progetto',
      scroll: 'A OGNUNO IL SUO INGRESSO',
      cap1: 'MONACO, LA MUSICA IN COMUNE.',
      cap2: 'LABEL INDIPENDENTE / CULTURA COLLETTIVA',
    },
    paths: {
      eyebrow: 'L’UNIVERSO TRACTOPELLE',
      title: 'Sei qui per cosa?',
      lead: 'Musica, progetti, collaborazioni e date.',
      items: [
        {
          number: '01',
          title: 'Fan',
          text: 'Gli artisti. I brani. I video.',
          cta: 'Esplora la musica',
          href: '#musique',
        },
        {
          number: '02',
          title: 'Artisti & creator',
          text: 'Non serve un lungo discorso. Facci ascoltare quello che fai.',
          cta: 'Presenta un progetto',
          kind: 'demo',
        },
        {
          number: '03',
          title: 'Brand & partner',
          text: 'Una campagna, una licenza, un’idea con un artista? Raccontaci il progetto.',
          cta: 'Proponi una collaborazione',
          kind: 'collaboration',
        },
        {
          number: '04',
          title: 'Booking & eventi',
          text: 'Un palco. Una data. Un budget, anche da definire. Parliamone.',
          cta: 'Richiedi un booking',
          kind: 'booking',
        },
      ],
    },
    artists: {
      eyebrow: 'VOCI. UNIVERS.',
      title: 'Gli artisti.',
      all: 'Tutti gli artisti',
      discover: 'Scopri',
      discoverAria: (name) => `Scopri ${name} sul sito ufficiale (nuova scheda)`,
      caption: 'Una selezione del roster ufficiale. I profili si aprono su tractopellemusic.com.',
    },
    releases: {
      eyebrow: 'PRIMA DI TUTTO IL SUONO',
      title: 'Ultime uscite.',
      all: 'Tutto il catalogo',
      coverAlt: (title) => `Cover di ${title}`,
      cardAria: (title) => `${title} — scheda ufficiale (nuova scheda)`,
      bottom: 'Le piattaforme per ascoltare. La label per andare oltre.',
      spotify: 'Ascolta su Spotify',
      types: { Single: 'Single', Compilation: 'Compilation', EP: 'EP' },
    },
    collab: {
      eyebrow: 'BRAND & PARTNER',
      titleBefore: 'Un’idea va bene.\nUn progetto concreto, ',
      titleAccent: 'meglio.',
      p1: 'Brand, agenzie, produttori: diteci cosa preparate,',
      p2: 'con chi e per quando.',
      cta: 'Proponi una collaborazione',
      visual: 'IL TUO UNIVERSO × LA NOSTRA MUSICA',
      tags: ['Partnership di brand', 'Licenze musicali', 'Campagne & creazione', 'Progetti audiovisivi'],
    },
    booking: {
      visualEyebrow: 'DAL SUONO AL PALCO',
      eyebrow: 'BOOKING & EVENTI',
      title: 'Avete il palco.\nParliamo dello show.',
      p1: 'Festival, concerti, eventi privati e produzioni live.',
      p2: 'Portare Tractopelle non è lo show di un solo artista: sul palco salgono MC Pao, altri artisti della label, DJ e una crew che trasforma la serata in un party. Un nuovo modello live — collettivo, immersivo, ad alta energia.',
      cta: 'Proponi una data',
      note: 'Una proposta di data, senza impegno di disponibilità. Budget e capienza possono restare da definire.',
    },
    demos: {
      eyebrow: 'ARTISTI & PROFESSIONISTI',
      titleBefore: 'Hai un progetto?\nFacci ',
      titleAccent: 'ascoltare.',
      p1: 'Artista, beatmaker, autore, videomaker o manager:',
      p2: 'condividi il tuo lavoro e spiega cosa cerchi.',
      roles: ['Artista', 'Manager', 'Clipper', 'Topliner', 'Autore', 'Producer'],
      steps: ['01 Profilo', '02 Progetto', '03 Riepilogo'],
      cta: 'Presenta il mio progetto',
    },
    community: {
      eyebrow: 'LA LISTE · LA COMMUNITY',
      title: 'Nessuna apertura al momento.\nLe prossime saranno qui.',
      lead: 'Ascolti privati, anteprime,\nesperienze.',
      items: ['Ascolti privati', 'Anteprime', 'Eventi & esperienze'],
      status: 'Nessuna apertura annunciata',
      bottom: 'Nulla di aperto in questo momento. Restiamo in ascolto.',
      cta: 'Consulta La Liste',
    },
    footer: {
      backTop: 'Torna su',
      colLabel: ['LA LABEL', 'FACCIAMO SQUADRA', 'RESTIAMO CONNESSI', 'LA COMMUNITY'],
      links: ['Gli artisti', 'La musica', 'Collaborazioni', 'Booking', 'Presenta un progetto', 'La Liste', 'Le prossime aperture'],
      local: 'Monaco, MC',
      brand: 'TRACTOPELLE MUSIK',
      disclaimer: 'Concept indipendente · Demo frontend non ufficiale',
      privacy: 'Conversazioni dimostrative · Nessuna AI collegata · Nessun invio alla label.',
    },
    modal: {
      eyebrow: 'TRACTOPELLE · DEMO',
      close: 'Chiudi la finestra',
      successTitle: 'Simulazione completata.',
      successIntro: 'Demo: la tua richiesta è stata simulata. Nessuna informazione è stata inviata.',
      successMuted: 'I dati inseriti sono stati cancellati.',
      successCta: 'Torna al sito',
      reviewTitle: 'Il tuo riepilogo.',
      demoNote: 'Modulo dimostrativo. Nessun invio, nessun salvataggio.',
      steps: ['Il tuo profilo', 'Il tuo progetto', 'Riepilogo'],
      stepsAria: 'Fasi del progetto',
      empty: 'Non compilato',
      optional: ' (facoltativo)',
      choose: 'Scegli…',
      required: '* Campi obbligatori',
      back: 'Indietro',
      continue: 'Continua',
      review: 'Vedi il riepilogo',
      edit: 'Modifica',
      confirm: 'Conferma la simulazione',
      errors: {
        required: 'Compila questo campo.',
        email: 'Inserisci un indirizzo email valido.',
        url: 'Aggiungi un link completo che inizi con https://.',
        number: 'Indica un numero intero maggiore di zero.',
        date: 'Scegli una data futura.',
      },
    },
    forms: {
      collaboration: {
        title: 'Creiamo qualcosa insieme.',
        intro: 'Presenta i contorni della tua collaborazione.',
        fields: [
          { name: 'company', label: 'Nome dell’azienda' },
          { name: 'contact', label: 'Nome del contatto' },
          { name: 'email', label: 'Email professionale', type: 'email' },
          {
            name: 'type',
            label: 'Tipo di collaborazione',
            options: [
              'Partnership di brand',
              'Product placement',
              'Campagna digitale',
              'Licenza musicale',
              'Progetto audiovisivo',
              'Altra collaborazione',
            ],
          },
          { name: 'artist', label: 'Artista coinvolto', options: artistOptions, optional: true },
          { name: 'budget', label: 'Budget previsto (€)', type: 'number', optional: true, placeholder: 'Non lo so ancora' },
          { name: 'period', label: 'Data o periodo del progetto', optional: true, placeholder: 'Es. primavera 2027', wide: true },
          { name: 'description', label: 'Descrizione del progetto', type: 'textarea', wide: true },
        ],
      },
      booking: {
        title: 'Fate salire Tractopelle sul palco.',
        intro: 'Una proposta di data, senza impegno di disponibilità.',
        fields: [
          { name: 'organizer', label: 'Nome dell’organizzatore' },
          { name: 'company', label: 'Azienda o struttura', optional: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'city', label: 'Città' },
          { name: 'country', label: 'Paese' },
          {
            name: 'type',
            label: 'Tipo di evento',
            options: ['Concerto', 'Festival', 'Evento privato', 'Produzione live', 'Altro evento'],
          },
          { name: 'date', label: 'Data desiderata', type: 'date', optional: true },
          { name: 'artist', label: 'Artista richiesto', options: [...artistOptions, 'Non lo so ancora'] },
          { name: 'capacity', label: 'Capienza stimata del locale', type: 'number', optional: true, placeholder: 'Non lo so ancora' },
          { name: 'budget', label: 'Budget indicativo (€)', type: 'number', optional: true, placeholder: 'Non lo so ancora' },
          { name: 'description', label: 'Informazioni aggiuntive', type: 'textarea', optional: true, wide: true },
        ],
      },
      demo: {
        title: 'Il tuo progetto merita di essere ascoltato.',
        intro: 'Artisti e professionisti: raccontaci cosa fai.',
        fields: [
          { name: 'name', label: 'Nome o blaze', stage: 0 },
          { name: 'email', label: 'Email', type: 'email', stage: 0 },
          {
            name: 'role',
            label: 'Ruolo',
            options: ['Artista', 'Manager', 'Clipper', 'Topliner', 'Autore', 'Producer'],
            stage: 0,
          },
          { name: 'city', label: 'Città', stage: 0, optional: true },
          { name: 'url', label: 'Link al progetto', type: 'url', placeholder: 'https://…', stage: 1, wide: true },
          { name: 'description', label: 'Presentazione breve', type: 'textarea', stage: 1, wide: true },
        ],
      },
      community: {
        title: 'Restiamo in contatto.',
        intro: 'La Liste: ascolti privati, anteprime ed esperienze.',
        fields: [{ name: 'email', label: 'Il tuo indirizzo email', type: 'email', wide: true }],
      },
    },
  },
};
