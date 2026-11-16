'use client';
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { dictionaries, type Dictionary, type Lang } from '@/data/i18n';

type LangContextValue = {
  lang: Lang;
  t: Dictionary;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  switching: boolean;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = 'tracto-lang';

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');
  const [ready, setReady] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [burstLang, setBurstLang] = useState<Lang>('fr');
  const reduce = useReducedMotion();

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'fr' || saved === 'it') setLangState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.title = dictionaries[lang].meta.title;
  }, [lang, ready]);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang || switching) return;
      setBurstLang(next);
      setBurstKey((k) => k + 1);
      setSwitching(true);
      window.setTimeout(
        () => {
          setLangState(next);
        },
        reduce ? 0 : 220,
      );
      window.setTimeout(
        () => {
          setSwitching(false);
        },
        reduce ? 120 : 900,
      );
    },
    [lang, switching, reduce],
  );

  const toggle = useCallback(() => {
    setLang(lang === 'it' ? 'fr' : 'it');
  }, [lang, setLang]);

  const value = useMemo(
    () => ({ lang, t: dictionaries[lang], setLang, toggle, switching }),
    [lang, setLang, toggle, switching],
  );

  return (
    <LangContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {switching && (
          <motion.div
            key={burstKey}
            className="lang-burst"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="lang-burst-wash"
              initial={{ clipPath: 'circle(0% at 88% 4%)' }}
              animate={{ clipPath: 'circle(160% at 88% 4%)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className="lang-burst-code"
              initial={{ scale: 0.4, opacity: 0, rotate: -18, filter: 'blur(12px)' }}
              animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' }}
              exit={{ scale: 1.35, opacity: 0, filter: 'blur(18px)' }}
              transition={{ duration: reduce ? 0.15 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {burstLang.toUpperCase()}
            </motion.span>
            <span className="lang-burst-spark s1" />
            <span className="lang-burst-spark s2" />
            <span className="lang-burst-spark s3" />
            <span className="lang-burst-spark s4" />
            <span className="lang-burst-spark s5" />
          </motion.div>
        )}
      </AnimatePresence>
    </LangContext.Provider>
  );
}

export function LanguageSwitch() {
  const { lang, setLang, switching } = useLang();
  const reduce = useReducedMotion();
  const isIt = lang === 'it';

  return (
    <div className="lang-switch" role="group" aria-label="Lingua / Langue">
      <button
        type="button"
        className={!isIt ? 'is-active' : undefined}
        aria-pressed={!isIt}
        disabled={switching}
        onClick={() => setLang('fr')}
      >
        FR
      </button>
      <button
        type="button"
        className={`lang-switch-track ${isIt ? 'is-it' : 'is-fr'}`}
        aria-label={isIt ? 'Passa al francese' : 'Passer à l’italien'}
        disabled={switching}
        onClick={() => setLang(isIt ? 'fr' : 'it')}
      >
        <motion.span
          className="lang-switch-thumb"
          animate={{ x: isIt ? 23 : 0, rotate: isIt ? 180 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 420, damping: 26, mass: 0.65 }
          }
        >
          <span className="lang-switch-glow" />
          <motion.span
            key={lang}
            className="lang-switch-core"
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: isIt ? -180 : 0 }}
            transition={{ duration: 0.28 }}
          >
            {isIt ? 'IT' : 'FR'}
          </motion.span>
        </motion.span>
        <span className="lang-switch-orbit" />
      </button>
      <button
        type="button"
        className={isIt ? 'is-active' : undefined}
        aria-pressed={isIt}
        disabled={switching}
        onClick={() => setLang('it')}
      >
        IT
      </button>
    </div>
  );
}
