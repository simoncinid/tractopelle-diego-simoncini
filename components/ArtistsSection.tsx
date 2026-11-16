'use client';
import { ArrowUpRight } from 'lucide-react';
import { artists, official } from '@/data/mockData';
import { useLang } from '@/components/LanguageProvider';

export default function ArtistsSection() {
  const { t } = useLang();
  const a = t.artists;

  return (
    <section id="artistes" className="section artists-section" aria-labelledby="artists-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{a.eyebrow}</span>
          <h2 id="artists-title">{a.title}</h2>
        </div>
        <a className="subtle-link" href={official + '/artistes'} target="_blank" rel="noreferrer">
          {a.all} <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="artists-grid">
        {artists.map((artist, i) => (
          <a
            key={artist.slug}
            href={official + '/artistes/' + artist.slug}
            target="_blank"
            rel="noreferrer"
            className="artist-card"
            aria-label={a.discoverAria(artist.name)}
          >
            <div className="artist-photo">
              <img src={'/assets/' + artist.image} alt={artist.name} loading="lazy" width="384" height="480" />
              <span className="artist-index">0{i + 1}</span>
              <span className="artist-arrow">
                <ArrowUpRight size={20} />
              </span>
              <h3>{artist.name}</h3>
            </div>
            <span className="artist-discover">
              {a.discover} <ArrowUpRight size={13} />
            </span>
          </a>
        ))}
      </div>
      <p className="source-caption">{a.caption}</p>
    </section>
  );
}
