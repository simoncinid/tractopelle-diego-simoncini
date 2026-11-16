'use client';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { releases, official, socials } from '@/data/mockData';
import { formatDate } from '@/lib/format';
import { useLang } from '@/components/LanguageProvider';

export default function ReleasesSection() {
  const { t, lang } = useLang();
  const r = t.releases;

  return (
    <section id="musique" className="section releases-section" aria-labelledby="releases-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{r.eyebrow}</span>
          <h2 id="releases-title">{r.title}</h2>
        </div>
        <a href={official + '/sorties'} target="_blank" rel="noreferrer" className="subtle-link">
          {r.all} <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="releases-grid">
        {releases.map((item) => (
          <a
            key={item.slug}
            href={official + '/sorties/' + item.slug}
            target="_blank"
            rel="noreferrer"
            className="release-card"
            aria-label={r.cardAria(item.title)}
          >
            <div className="release-cover">
              <img
                src={'/assets/' + item.image}
                alt={r.coverAlt(item.title)}
                loading="lazy"
                width="400"
                height="400"
              />
              <span className="release-action">
                <ArrowUpRight size={22} />
              </span>
            </div>
            <div className="release-meta">
              <span className="eyebrow">{r.types[item.type] || item.type}</span>
              <span className="release-date">{formatDate(item.date.split('.').reverse().join('-'), lang)}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.artist}</p>
          </a>
        ))}
      </div>
      <div className="music-bottom">
        <span>{r.bottom}</span>
        <a
          href={socials[0].url}
          target="_blank"
          rel="noreferrer"
          className="btn music-spotify"
        >
          {r.spotify} <ArrowRight size={17} />
        </a>
      </div>
    </section>
  );
}
