import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tractopelle Musik — Monaco Only Music Label · Concept',
  description:
    'Artistes, musique et projets. Concept indépendant, démonstration non officielle.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
