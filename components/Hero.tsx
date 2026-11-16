"use client";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import ArtScene from "@/components/ArtScene";
import { useLang } from "@/components/LanguageProvider";

export default function Hero() {
  const { t, lang } = useLang();
  const h = t.hero;

  return (
    <section className="hero" id="accueil" aria-labelledby="hero-title">
      <div className="hero-aurora" />
      <div key={lang} className="hero-content">
        <div className="hero-topline">
          <span className="label-pill">
            <i /> {h.pill}
          </span>
          <span className="eyebrow hero-name">TRACTOPELLE MUSIK</span>
        </div>
        <div className="hero-stage">
          <h1 id="hero-title">
            {[h.h1a, h.h1b, h.h1c].map((line, index) => (
              <span
                className={`hero-line${index === 2 ? " hero-line-accent" : ""}`}
                key={index}
              >
                <span className="hero-line-text">{line}</span>
              </span>
            ))}
          </h1>
          <ArtScene
            src="/assets/generated/sonic-orbit.webp"
            className="hero-sculpture"
            priority
          />
        </div>
        <div className="hero-bottom">
          <div>
            <p>
              {h.p1} {h.p2}
            </p>
            <div className="button-row">
              <a className="btn" href="#musique">
                {h.ctaArtists} <ArrowUpRight size={17} />
              </a>
              <a className="btn ghost" href="#parcours">
                {h.ctaWork} <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
          <a href="#parcours" className="hero-scroll">
            <span className="eyebrow">{h.scroll}</span>
            <span className="circle">
              <ArrowDown size={20} />
            </span>
          </a>
        </div>
      </div>
      <div className="hero-caption">
        <span>{h.cap1}</span>
        <span>{h.cap2}</span>
      </div>
    </section>
  );
}
