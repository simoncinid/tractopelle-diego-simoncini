// Snapshot éditorial du site officiel, vérifié le 16 novembre 2026.
// Les parcours et formulaires sont des propositions de démonstration.
export const official = "https://tractopellemusic.com";
export const artists = [
  { name: "MC Pao", slug: "mc-pao", image: "mc-pao.jpg" },
  { name: "Alkpote", slug: "alkpote", image: "alkpote.jpg" },
  { name: "Baby Kirua", slug: "baby-kirua", image: "kirua.jpg" },
  { name: "Taipan", slug: "taipan", image: "taipan.jpg" },
  { name: "Tmax", slug: "tmax", image: "tmax.jpg" },
  { name: "VEUST", slug: "veust", image: "veust.jpg" },
];
export const releases = [
  {
    title: "Donne ta teuch",
    slug: "donne-ta-teuch",
    artist: "Tractopelle Musik",
    type: "Single",
    date: "17.07.2026",
    image: "ab67616d0000b273cfec2d48bea300f8d9968281.jpg",
  },
  {
    title: "Tracto Azzuro",
    slug: "tracto-azzuro",
    artist: "Tractopelle Musik",
    type: "Compilation",
    date: "01.07.2026",
    image: "ab67616d0000b273c099bbd49bdefda1d8132d93.jpg",
  },
  {
    title: "Summer Brainrot",
    slug: "summer-brainrot",
    artist: "Tractopelle Musik",
    type: "EP",
    date: "20.06.2026",
    image: "ab67616d0000b273f16935b8a6c2b2e0535c787b.jpg",
  },
  {
    title: "KDO",
    slug: "kdo",
    artist: "Tractopelle Musik",
    type: "Single",
    date: "10.06.2026",
    image: "ab67616d0000b2736c88e21c6d4cd4d3a611e7ed.jpg",
  },
];
export const socials = [
  {
    name: "Spotify",
    url: "https://open.spotify.com/intl-fr/artist/4nM9QTw9xOGr1yXbJH7lSt",
  },
  { name: "YouTube", url: "https://www.youtube.com/@tractopellemusik" },
  { name: "Instagram", url: "https://www.instagram.com/tractolabel/" },
];
export type FormKind = "collaboration" | "booking" | "demo" | "community";
export type Field = {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  optional?: boolean;
  wide?: boolean;
  placeholder?: string;
  stage?: number;
};
