'use client';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { lockPageScroll } from '@/lib/scrollLock';
import { trapDialogFocus } from '@/lib/dialog';
import { LanguageSwitch, useLang } from '@/components/LanguageProvider';

function Brand() {
  return (
    <a href="#accueil" className="brand" aria-label="Tractopelle Musik">
      <img src="/assets/tractolabel.jpg" width="34" height="34" alt="" />
      <span>
        Tractopelle Musik<small>MONACO</small>
      </span>
    </a>
  );
}

export default function Header({ openDemo }: { openDemo: () => void }) {
  const menu = useRef<HTMLDialogElement>(null);
  const releaseScroll = useRef<(() => void) | null>(null);
  useEffect(() => () => releaseScroll.current?.(), []);
  const { t } = useLang();

  return (
    <>
      <a href="#contenu" className="skip-link">
        {t.skip}
      </a>
      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label={t.mainNav}>
          {t.nav.map(([label, id]) => (
            <a key={id} href={'#' + id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          <button className="header-cta" onClick={openDemo}>
            {t.headerCta} <ArrowUpRight size={14} />
          </button>
        </div>
        <button
          className="menu-toggle icon-button"
          aria-label={t.openMenu}
          aria-haspopup="dialog"
          onClick={() => {
            releaseScroll.current?.();
            releaseScroll.current = lockPageScroll();
            menu.current?.showModal();
          }}
        >
          <Menu />
        </button>
      </header>
      <dialog
        ref={menu}
        className="mobile-menu"
        onKeyDown={trapDialogFocus}
        onClose={() => {
          releaseScroll.current?.();
          releaseScroll.current = null;
        }}
        aria-label={t.mobileNav}
      >
        <div className="mobile-menu-head">
          <span className="eyebrow">TRACTOPELLE · MONACO</span>
          <div className="mobile-menu-tools">
            <LanguageSwitch />
            <button className="icon-button" onClick={() => menu.current?.close()} aria-label={t.closeMenu}>
              <X />
            </button>
          </div>
        </div>
        <nav aria-label={t.mobileNav}>
          {t.nav.map(([label, id], i) => (
            <a href={'#' + id} key={id} onClick={() => menu.current?.close()}>
              <span className="eyebrow">0{i + 1}</span>
              {label}
              <ArrowUpRight size={20} />
            </a>
          ))}
        </nav>
        <button
          className="btn"
          onClick={() => {
            menu.current?.close();
            openDemo();
          }}
        >
          {t.headerCta} <ArrowUpRight size={16} />
        </button>
        <p className="demo-note">{t.demoNote}</p>
      </dialog>
    </>
  );
}
