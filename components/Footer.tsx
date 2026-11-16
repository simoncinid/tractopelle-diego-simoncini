'use client';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { official, socials, type FormKind } from '@/data/mockData';
import { useLang } from '@/components/LanguageProvider';

export default function Footer({ open }: { open: (k: FormKind) => void }) {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="section footer">
      <div className="footer-top">
        <a className="footer-name" href="#accueil">
          Monaco only
          <br />
          <span>music label.</span>
        </a>
        <a href="#accueil" className="back-top" aria-label={f.backTop}>
          <ArrowUp size={21} />
        </a>
      </div>
      <div className="footer-columns">
        <div>
          <span className="eyebrow">{f.colLabel[0]}</span>
          <a href={official + '/labels/tractolabel'} target="_blank" rel="noreferrer">
            TractoLabel <ArrowUpRight size={12} />
          </a>
          <a href="#artistes">{f.links[0]}</a>
          <a href="#musique">{f.links[1]}</a>
        </div>
        <div>
          <span className="eyebrow">{f.colLabel[1]}</span>
          <button onClick={() => open('collaboration')}>{f.links[2]}</button>
          <button onClick={() => open('booking')}>{f.links[3]}</button>
          <button onClick={() => open('demo')}>{f.links[4]}</button>
        </div>
        <div>
          <span className="eyebrow">{f.colLabel[2]}</span>
          {socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer">
              {s.name} <ArrowUpRight size={12} />
            </a>
          ))}
        </div>
        <div>
          <span className="eyebrow">{f.colLabel[3]}</span>
          <a href="#la-liste">{f.links[5]}</a>
          <button onClick={() => open('community')}>{f.links[6]}</button>
          <span className="footer-local">{f.local}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{f.brand}</span>
        <p>{f.disclaimer}</p>
        <span>{f.privacy}</span>
      </div>
    </footer>
  );
}
