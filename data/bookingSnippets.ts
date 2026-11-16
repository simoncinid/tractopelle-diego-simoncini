/** Spezzoni demo per la sezione Booking. Sostituibili con clip ufficiali. */
export type BookingSnippet = {
  id: string;
  artist: string;
  image: string;
  src: string;
  /** Durata stimata in secondi (usata come fallback prima del metadata). */
  duration: number;
};

export const bookingSnippets: BookingSnippet[] = [
  {
    id: "mc-pao",
    artist: "MC Pao",
    image: "mc-pao.jpg",
    src: "/assets/audio/mc-pao.mp3",
    duration: 10,
  },
];
