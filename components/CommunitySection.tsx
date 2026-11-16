'use client';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

export default function CommunitySection({ open }: { open: () => void }) {
  const { t } = useLang();
  const c = t.community;
  const [title1, title2] = c.title.split('\n');
  const [lead1, lead2] = c.lead.split('\n');

  return (
    <section id="la-liste" className="section community-section" aria-labelledby="community-title">
      <div className="community-head">
        <div>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 id="community-title">
            {title1}
            <br />
            {title2}
          </h2>
        </div>
        <p>
          {lead1}
          <br />
          {lead2}
        </p>
      </div>
      <div className="community-grid">
        {c.items.map((item, i) => (
          <div key={item}>
            <span className="eyebrow">0{i + 1}</span>
            <h3>{item}</h3>
            <span className="neutral-status">{c.status}</span>
          </div>
        ))}
      </div>
      <div className="community-bottom">
        <p>{c.bottom}</p>
        <button className="text-link" onClick={open}>
          {c.cta} <ArrowUpRight size={17} />
        </button>
      </div>
    </section>
  );
}
