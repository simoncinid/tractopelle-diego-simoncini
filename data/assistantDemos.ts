import { emptyLead, type Lead } from '@/lib/assistant';
import type { FormKind } from './mockData';
export type DemoScenario = {
  id: string; kind: Exclude<FormKind, 'community'>; title: string;
  users: string[]; replies: string[]; lead: Lead;
};
// Fictional presentation examples. They are never sent or presented as real projects.
export const assistantDemos: Record<'fr' | 'it', DemoScenario[]> = {
  fr: [
    {
      id: 'artists', kind: 'demo', title: 'Artistes & créateurs',
      users: ['Je suis beatmaker. J’ai un EP de six titres à présenter.', 'Je cherche un accompagnement pour la sortie.', 'Voici un lien d’exemple : https://example.com/ep-demo. Le calendrier reste à définir.'],
      replies: ['Tu cherches quoi pour cet EP ?', 'Tu as un lien d’écoute à partager ?', 'Voici le brief de cet exemple. Aucun morceau n’a été écouté et aucune décision artistique n’a été prise. Tu peux relire le projet avant de tester le formulaire de contact.'],
      lead: { ...emptyLead, summary: 'Exemple fictif : un beatmaker présente un EP de six titres et cherche un accompagnement pour sa sortie.', role: 'Beatmaker', timeframe: 'À définir', projectUrl: 'https://example.com/ep-demo' },
    },
    {
      id: 'collaboration', kind: 'collaboration', title: 'Marques & partenaires',
      users: ['Notre agence prépare un film de marque. Nous cherchons une licence musicale.', 'Une diffusion en ligne en France, pendant trois mois.', 'Nous prévoyons 5 000 € pour la musique. Le choix du titre et la période restent à préciser.'],
      replies: ['Où le film serait-il diffusé ?', 'Avez-vous un budget indicatif ?', 'Voici les éléments du brief. Cette démonstration ne confirme ni droits disponibles, ni tarif, ni accord de licence.'],
      lead: { ...emptyLead, summary: 'Exemple fictif : licence musicale pour un film de marque, diffusé en ligne en France pendant trois mois.', organization: 'Agence — exemple fictif', location: 'France · en ligne', timeframe: 'À préciser', budget: '5000' },
    },
    {
      id: 'booking', kind: 'booking', title: 'Booking artiste',
      users: ['Nous aimerions proposer MC Pao pour un concert.', 'À Nice, dans une salle de 400 personnes.', 'Je ne sais pas encore pour la date et le budget.'],
      replies: ['Dans quelle ville se tiendrait le concert ?', 'Avez-vous déjà une date en tête ?', 'La date et le budget peuvent rester à définir pour ce premier contact. Voici le brief de l’exemple ; aucune disponibilité n’a été vérifiée.'],
      lead: { ...emptyLead, summary: 'Exemple fictif : proposition de concert à Nice, dans une salle de 400 personnes. Date et budget à définir.', artist: 'MC Pao — souhait du demandeur', location: 'Nice', timeframe: 'À définir', budget: 'À définir' },
    },
    {
      id: 'event', kind: 'booking', title: 'Événement avec Tractopelle',
      users: ['Je voudrais organiser une soirée avec Tractopelle. Comment présenter l’idée ?', 'Une soirée privée à Monaco, à l’automne 2027.', 'Le lieu, le format live et le budget restent à définir. Nous souhaitons d’abord en discuter.'],
      replies: ['Quel type de soirée préparez-vous ?', 'Le lieu est-il déjà choisi ?', 'Voici les points de départ pour présenter cette soirée. Le format, les artistes et les conditions seraient à discuter avec l’équipe officielle. Cette démo ne propose aucune formule ni prestation confirmée.'],
      lead: { ...emptyLead, summary: 'Exemple fictif : demande d’informations pour organiser une soirée privée avec Tractopelle à Monaco. Lieu, format et budget à préciser.', organization: 'Organisateur — exemple fictif', location: 'Monaco', timeframe: 'Automne 2027 — exemple', budget: 'À définir' },
    },
  ],
  it: [
    { id: 'artists', kind: 'demo', title: 'Artisti & creator', users: ['Sono un beatmaker. Ho un EP di sei tracce da presentare.', 'Cerco un accompagnamento per l’uscita.', 'Ecco un link di esempio: https://example.com/ep-demo. Il calendario è da definire.'], replies: ['Cosa cerchi per questo EP?', 'Hai un link di ascolto da condividere?', 'Ecco il brief dell’esempio. Nessun brano è stato ascoltato e nessuna decisione artistica è stata presa. Puoi rileggere il progetto prima di provare il modulo di contatto.'], lead: { ...emptyLead, summary: 'Esempio fittizio: un beatmaker presenta un EP di sei tracce e cerca supporto per l’uscita.', role: 'Beatmaker', timeframe: 'Da definire', projectUrl: 'https://example.com/ep-demo' } },
    { id: 'collaboration', kind: 'collaboration', title: 'Brand & partner', users: ['La nostra agenzia prepara un film di brand. Cerchiamo una licenza musicale.', 'Diffusione online in Francia per tre mesi.', 'Prevediamo 5 000 € per la musica. Brano e periodo sono da precisare.'], replies: ['Dove verrebbe diffuso il film?', 'Avete un budget indicativo?', 'Ecco gli elementi del brief. Questa demo non conferma diritti disponibili, tariffe o accordi di licenza.'], lead: { ...emptyLead, summary: 'Esempio fittizio: licenza musicale per un film di brand online in Francia per tre mesi.', organization: 'Agenzia — esempio fittizio', location: 'Francia · online', timeframe: 'Da precisare', budget: '5000' } },
    { id: 'booking', kind: 'booking', title: 'Booking artista', users: ['Vorremmo proporre MC Pao per un concerto.', 'A Nizza, in una sala da 400 persone.', 'Non sappiamo ancora data e budget.'], replies: ['In quale città si terrebbe il concerto?', 'Avete già una data in mente?', 'Data e budget possono restare da definire al primo contatto. Ecco il brief dell’esempio: nessuna disponibilità è stata verificata.'], lead: { ...emptyLead, summary: 'Esempio fittizio: proposta di concerto a Nizza in una sala da 400 persone. Data e budget da definire.', artist: 'MC Pao — desiderio del richiedente', location: 'Nizza', timeframe: 'Da definire', budget: 'Da definire' } },
    { id: 'event', kind: 'booking', title: 'Evento con Tractopelle', users: ['Vorrei organizzare una serata con Tractopelle. Come presentare l’idea?', 'Una serata privata a Monaco, nell’autunno 2027.', 'Luogo, formato live e budget sono da definire. Vorremmo prima parlarne.'], replies: ['Che tipo di serata stai preparando?', 'Avete già scelto il luogo?', 'Ecco i punti di partenza. Formato, artisti e condizioni andrebbero discussi con il team ufficiale. Questa demo non propone formule o prestazioni confermate.'], lead: { ...emptyLead, summary: 'Esempio fittizio: informazioni per organizzare una serata privata con Tractopelle a Monaco. Luogo, formato e budget da precisare.', organization: 'Organizzatore — esempio fittizio', location: 'Monaco', timeframe: 'Autunno 2027 — esempio', budget: 'Da definire' } },
  ],
};
