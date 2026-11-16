'use client';
import { ArrowUpRight, Headphones, Mic2, Handshake, AudioLines } from 'lucide-react';
import type { FormKind } from '@/data/mockData';
import { useLang } from '@/components/LanguageProvider';

const icons = [Headphones, Mic2, Handshake, AudioLines];

export default function AudiencePaths({ open }: { open: (k: FormKind) => void }) {
  const { t } = useLang();
  const { paths } = t;

  return (
    <section className="paths-section section" id="parcours" aria-labelledby="paths-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{paths.eyebrow}</span>
          <h2 id="paths-title">{paths.title}</h2>
        </div>
        <p>{paths.lead}</p>
      </div>
      <div className="paths-grid">
        {paths.items.map((p, i) => {
          const Icon = icons[i];
          return (
            <article className="path-card" key={p.number}>
              <div className="path-top">
                <span className="eyebrow">{p.number} /</span>
                <Icon size={23} strokeWidth={1.4} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              {p.href ? (
                <a href={p.href} className="text-link">
                  {p.cta}
                  <ArrowUpRight size={17} />
                </a>
              ) : (
                <button className="text-link" onClick={() => open(p.kind as FormKind)}>
                  {p.cta}
                  <ArrowUpRight size={17} />
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
