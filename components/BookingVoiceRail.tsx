"use client";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { Mic, Square, Play } from "lucide-react";
import {
  bookingSnippets,
  type BookingSnippet,
} from "@/data/bookingSnippets";
import {
  SILENT_BEAT,
  type BeatLevels,
} from "@/components/BookingBeatfield";

const WAVE_BARS = [4, 9, 14, 8, 16, 11, 18, 7, 15, 10, 17, 6, 13, 19, 9, 14, 8, 12];

/** Single shared element — prevents overlapping ghosts from HMR / remounts. */
let sharedAudio: HTMLAudioElement | null = null;
let sharedCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedData: Uint8Array<ArrayBuffer> | null = null;
let sharedWired = false;
let activeOwner: symbol | null = null;
let sessionAudioEnabled = true;
let mediaUnlocked = false;
let unlockPromise: Promise<boolean> | null = null;

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `0:${String(safe).padStart(2, "0")}`;
}

function Waveform({ active, progress }: { active: boolean; progress: number }) {
  return (
    <div className="voice-wave" aria-hidden="true">
      {WAVE_BARS.map((h, i) => {
        const lit = i / WAVE_BARS.length <= progress;
        return (
          <span
            key={i}
            className={active && lit ? "is-lit" : undefined}
            style={{
              height: `${h}px`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function hardStopAudio() {
  if (sharedAudio) {
    sharedAudio.pause();
    try {
      sharedAudio.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
}

function getOrCreateAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
    sharedAudio.setAttribute("playsinline", "true");
    sharedAudio.setAttribute("webkit-playsinline", "true");
  }
  return sharedAudio;
}

/** Sblocca l’autoplay durante un gesto utente (tocco/click), così allo scroll in sezione parte senza Play. */
function unlockMedia(): Promise<boolean> {
  if (mediaUnlocked) return Promise.resolve(true);
  if (unlockPromise) return unlockPromise;
  unlockPromise = (async () => {
    const audio = getOrCreateAudio();
    const first = bookingSnippets[0];
    if (first && !audio.getAttribute("src") && !audio.src) {
      audio.src = first.src;
    }
    try {
      audio.muted = true;
      await audio.play();
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      mediaUnlocked = true;
    } catch {
      mediaUnlocked = false;
    } finally {
      audio.muted = false;
    }
    try {
      await resumeSharedContext();
    } catch {
      /* ignore */
    }
    return mediaUnlocked;
  })();
  return unlockPromise;
}

async function resumeSharedContext() {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
    sharedWired = false;
    sharedAnalyser = null;
    sharedData = null;
  }
  if (sharedCtx.state === "suspended") {
    try {
      await sharedCtx.resume();
    } catch {
      /* ignore */
    }
  }
  return sharedCtx;
}

async function wireSharedAnalyser(audio: HTMLAudioElement) {
  if (sharedWired && sharedAnalyser) {
    await resumeSharedContext();
    return true;
  }
  const ctx = await resumeSharedContext();
  if (!ctx || ctx.state !== "running") return false;
  try {
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    sharedAnalyser = analyser;
    sharedData = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    sharedWired = true;
    return true;
  } catch {
    // Element already wired in a previous graph — keep playing without rewire.
    return sharedWired;
  }
}

type Props = {
  sectionRef: RefObject<HTMLElement | null>;
  micActive: boolean;
  levelsRef: MutableRefObject<BeatLevels>;
  onPlayingChange?: (playing: boolean) => void;
};

export default function BookingVoiceRail({
  sectionRef,
  micActive,
  levelsRef,
  onPlayingChange,
}: Props) {
  const reduced = useReducedMotion();
  const [blocked, setBlocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const userPausedRef = useRef(false);
  const enabledRef = useRef(true);
  const { lang } = useLang();
  useEffect(() => {
    enabledRef.current = sessionAudioEnabled;
  }, []);
  const ownerRef = useRef(Symbol("booking-voice"));
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const inViewRef = useRef(false);
  const micRef = useRef(micActive);
  const rafRef = useRef(0);
  const playGenRef = useRef(0);
  const [active, setActive] = useState(false);
  const [snippet, setSnippet] = useState<BookingSnippet | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  micRef.current = micActive;

  const writeLevels = useEffectEvent((levels: BeatLevels) => {
    levelsRef.current = levels;
  });

  const emitPlaying = useEffectEvent((playing: boolean) => {
    onPlayingChange?.(playing);
  });

  const stopLevelsLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    writeLevels(SILENT_BEAT);
  }, []);

  const startLevelsLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      if (!playingRef.current || activeOwner !== ownerRef.current) {
        writeLevels(SILENT_BEAT);
        return;
      }
      if (sharedAnalyser && sharedData && sharedWired) {
        sharedAnalyser.getByteFrequencyData(sharedData);
        const data = sharedData;
        const len = data.length;
        let bass = 0;
        let mid = 0;
        let treble = 0;
        const bEnd = Math.max(1, Math.floor(len * 0.12));
        const mEnd = Math.max(bEnd + 1, Math.floor(len * 0.45));
        for (let i = 0; i < bEnd; i++) bass += data[i] ?? 0;
        for (let i = bEnd; i < mEnd; i++) mid += data[i] ?? 0;
        for (let i = mEnd; i < len; i++) treble += data[i] ?? 0;
        bass /= bEnd * 255;
        mid /= (mEnd - bEnd) * 255;
        treble /= Math.max(1, len - mEnd) * 255;
        const energy = Math.min(1, bass * 0.55 + mid * 0.3 + treble * 0.15);
        writeLevels({
          energy: Math.pow(energy, 0.85),
          bass: Math.pow(bass, 0.8),
          mid: Math.pow(mid, 0.85),
          treble: Math.pow(treble, 0.9),
        });
      } else {
        const t = performance.now() / 1000;
        const bass = 0.35 + Math.sin(t * 4.2) * 0.25 + Math.sin(t * 9.1) * 0.12;
        const mid = 0.3 + Math.sin(t * 6.4 + 1) * 0.22;
        const treble = 0.22 + Math.sin(t * 11.5) * 0.18;
        writeLevels({
          energy: Math.min(1, bass * 0.5 + mid * 0.3 + treble * 0.2),
          bass: Math.max(0, Math.min(1, bass)),
          mid: Math.max(0, Math.min(1, mid)),
          treble: Math.max(0, Math.min(1, treble)),
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAll = useCallback(() => {
    playGenRef.current += 1;
    playingRef.current = false;
    if (activeOwner === ownerRef.current) {
      activeOwner = null;
      hardStopAudio();
    }
    emitPlaying(false);
    stopLevelsLoop();
    setActive(false);
    setSnippet(null);
    setProgress(0);
    setElapsed(0);
  }, [stopLevelsLoop]);

  const shouldRun = () => enabledRef.current && (inViewRef.current || micRef.current);

  const playAt = useEffectEvent(async (index: number) => {
    if (!shouldRun()) return;
    const next = bookingSnippets[index % bookingSnippets.length];
    if (!next) return;

    const gen = ++playGenRef.current;
    activeOwner = ownerRef.current;
    indexRef.current = index % bookingSnippets.length;

    // Always kill anything currently audible before starting the next clip.
    hardStopAudio();

    setBlocked(false);
    setPaused(false);
    userPausedRef.current = false;
    setSnippet(next);
    setActive(true);
    setProgress(0);
    setElapsed(0);
    setDuration(next.duration);

    const audio = getOrCreateAudio();
    audio.pause();
    audio.loop = true;
    audio.muted = false;
    audio.src = next.src;
    try {
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
    audio.volume = 0.9;

    try {
      if (!mediaUnlocked) {
        await unlockMedia();
      }
      // play() subito: eventuali await AudioContext spezzano il gesto utente e bloccano l’autoplay.
      audio.muted = false;
      await audio.play();

      if (gen !== playGenRef.current || activeOwner !== ownerRef.current) {
        hardStopAudio();
        return;
      }

      playingRef.current = true;
      setBlocked(false);
      setPaused(false);
      emitPlaying(true);
      startLevelsLoop();
      mediaUnlocked = true;

      if (micRef.current) {
        void resumeSharedContext().then(() => wireSharedAnalyser(audio));
      }
    } catch {
      if (gen === playGenRef.current) {
        setBlocked(true);
        playingRef.current = false;
        emitPlaying(false);
        stopLevelsLoop();
      }
    }
  });

  const advance = useEffectEvent(() => {
    if (userPausedRef.current) return;
    if (!shouldRun()) {
      stopAll();
      return;
    }
    // Un solo brano in loop: riparti dall'inizio se ended scatta comunque.
    void playAt(0);
  });

  const syncPlayback = useEffectEvent(() => {
    if (userPausedRef.current) return;
    if (!shouldRun()) {
      stopAll();
      return;
    }

    if (!playingRef.current || activeOwner !== ownerRef.current) {
      void playAt(indexRef.current || 0);
      return;
    }

    if (micRef.current) {
      void (async () => {
        await resumeSharedContext();
        const audio = sharedAudio;
        if (!audio) {
          void playAt(indexRef.current || 0);
          return;
        }
        if (!sharedWired) {
          await wireSharedAnalyser(audio);
        }
        if (audio.paused && shouldRun()) {
          try {
            await audio.play();
            playingRef.current = true;
            emitPlaying(true);
            startLevelsLoop();
          } catch {
            void playAt(indexRef.current || 0);
          }
        }
      })();
    }
  });

  function pauseCurrent() {
    playGenRef.current += 1;
    sessionAudioEnabled = false;
    enabledRef.current = false;
    userPausedRef.current = true;
    sharedAudio?.pause();
    playingRef.current = false;
    emitPlaying(false);
    stopLevelsLoop();
    setPaused(true);
  }
  async function resumeCurrent() {
    const audio = sharedAudio;
    if (!audio) return;
    const generation = ++playGenRef.current;
    sessionAudioEnabled = true;
    enabledRef.current = true;
    userPausedRef.current = false;
    activeOwner = ownerRef.current;
    try {
      await audio.play();
      if (generation !== playGenRef.current) return;
      playingRef.current = true;
      emitPlaying(true);
      setPaused(false);
      setBlocked(false);
      startLevelsLoop();
    } catch {
      userPausedRef.current = true;
      enabledRef.current = false;
      sessionAudioEnabled = false;
      setPaused(true);
    }
  }

  useEffect(() => {
    const audio = getOrCreateAudio();
    const onTime = () => {
      if (activeOwner !== ownerRef.current) return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      setDuration(audio.duration);
      setElapsed(audio.currentTime);
      setProgress(Math.min(1, audio.currentTime / audio.duration));
    };
    const onEnded = () => {
      if (activeOwner !== ownerRef.current) return;
      setProgress(1);
      window.setTimeout(() => advance(), 380);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const first = bookingSnippets[0];
    if (!first) return;
    const audio = getOrCreateAudio();
    if (!audio.src) {
      audio.src = first.src;
      audio.load();
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current =
          !!entry?.isIntersecting && (entry.intersectionRatio ?? 0) >= 0.12;
        syncPlayback();
      },
      { threshold: [0, 0.12, 0.25, 0.5, 0.75], rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      stopAll();
    };
  }, [sectionRef, reduced, stopAll]);

  useEffect(() => {
    syncPlayback();
  }, [micActive, reduced]);

  useEffect(() => {
    const onGesture = () => {
      if (!enabledRef.current || userPausedRef.current) return;
      void (async () => {
        await unlockMedia();
        if (inViewRef.current && enabledRef.current && !userPausedRef.current) {
          syncPlayback();
        }
      })();
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerdown", onGesture, opts);
    document.addEventListener("touchstart", onGesture, opts);
    document.addEventListener("keydown", onGesture, opts);
    document.addEventListener("click", onGesture, opts);
    return () => {
      document.removeEventListener("pointerdown", onGesture, opts);
      document.removeEventListener("touchstart", onGesture, opts);
      document.removeEventListener("keydown", onGesture, opts);
      document.removeEventListener("click", onGesture, opts);
    };
  }, []);

  // Se l’autoplay è ancora bloccato ma la sezione è in vista, riparti al prossimo tocco (stesso gesto).
  useEffect(() => {
    if (!blocked || userPausedRef.current) return;
    const kick = () => {
      if (!inViewRef.current || userPausedRef.current || !enabledRef.current) return;
      void (async () => {
        await unlockMedia();
        void playAt(indexRef.current || 0);
      })();
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerdown", kick, opts);
    document.addEventListener("touchstart", kick, opts);
    return () => {
      document.removeEventListener("pointerdown", kick, opts);
      document.removeEventListener("touchstart", kick, opts);
    };
  }, [blocked]);

  useEffect(
    () => () => {
      stopAll();
    },
    [stopAll],
  );


  return (
    <div className="booking-voice-rail" aria-live="polite">
      <AnimatePresence mode="wait">
        {active && snippet ? (
          <motion.div
            key={snippet.id}
            className="voice-bubble"
            initial={{ opacity: 0, y: 22, filter: "blur(8px)", scale: 0.96 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: -14, filter: "blur(10px)", scale: 0.94 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              className="voice-avatar"
              src={`/assets/${snippet.image}`}
              alt=""
              width={40}
              height={40}
              draggable={false}
            />
            <div className="voice-card">
              <div className="voice-meta">
                <strong>{snippet.artist}</strong>
                <span>
                  <Mic size={11} strokeWidth={2} aria-hidden="true" />
                  live drop
                </span>
              </div>
              <div className="voice-track">
                <Waveform active={active && !paused && !blocked} progress={progress} />
                <span className="voice-time">
                  {formatTime(elapsed)}
                  <i>/</i>
                  {formatTime(duration || snippet.duration)}
                </span>
              </div>
              <button className="voice-stop" type="button" aria-label={lang === 'fr' ? (paused ? 'Reprendre l’extrait' : blocked ? 'Lire l’extrait' : 'Arrêter le son') : (paused ? 'Riprendi estratto' : blocked ? 'Riproduci estratto' : 'Ferma audio')} title={lang === 'fr' ? (paused ? 'Reprendre au même endroit' : blocked ? 'Le navigateur demande une interaction pour lire le son' : 'Arrêter le son') : (paused ? 'Riprendi dallo stesso punto' : blocked ? 'Il browser richiede un’interazione per avviare l’audio' : 'Ferma audio')} onClick={(event) => {
                event.stopPropagation();
                if (paused) { void resumeCurrent(); return; }
                if (blocked) { void playAt(indexRef.current); return; }
                pauseCurrent();
              }}>{paused || blocked ? <Play size={17} fill="currentColor" /> : <Square size={17} fill="currentColor" />}</button>
              <div className="voice-progress" aria-hidden="true">
                <i style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
