"use client";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  AudioLines,
  Handshake,
  Disc3,
  Megaphone,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import ArtScene from "@/components/ArtScene";
import BookingBeatfield, {
  SILENT_BEAT,
  type BeatLevels,
} from "@/components/BookingBeatfield";
import BookingVoiceRail from "@/components/BookingVoiceRail";
import type { FormKind } from "@/data/mockData";
import { useLang } from "@/components/LanguageProvider";

const collabTagIcons: LucideIcon[] = [Handshake, Disc3, Megaphone, Clapperboard];

export function PartnershipsSection({ open }: { open: (k: FormKind) => void }) {
  const { t } = useLang();
  const c = t.collab;
  const [before, after] = c.titleBefore.split("\n");

  return (
    <section
      id="collaborations"
      className="section partnerships-section"
      aria-labelledby="collab-title"
    >
      <div className="collab-panel">
        <div className="collab-copy">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 id="collab-title">
            {before}
            <br />
            {after}
            <span>{c.titleAccent}</span>
          </h2>
          <p>
            {c.p1}
            <br className="desktop-break" /> {c.p2}
          </p>
          <button className="btn" onClick={() => open("collaboration")}>
            {c.cta} <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="collab-visual" aria-hidden="true">
          <ArtScene
            src="/assets/generated/collaboration-knot.png"
            className="collab-sculpture"
          />
          <span>{c.visual}</span>
        </div>
        <div className="collab-tags">
          {c.tags.map((tag, i) => {
            const Icon = collabTagIcons[i] ?? Handshake;
            return (
              <span key={tag}>
                <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BookingSection({ open }: { open: (k: FormKind) => void }) {
  const { t } = useLang();
  const b = t.booking;
  const titleLines = b.title.split("\n");
  const sectionRef = useRef<HTMLElement>(null);
  const levelsRef = useRef<BeatLevels>({ ...SILENT_BEAT });
  const [micActive, setMicActive] = useState(false);
  const [beatLive, setBeatLive] = useState(false);

  return (
    <section
      ref={sectionRef}
      id="booking"
      className={`section booking-section${beatLive ? " is-beating" : ""}`}
      aria-labelledby="booking-title"
    >
      <BookingBeatfield
        sectionRef={sectionRef}
        levelsRef={levelsRef}
        active={beatLive}
      />
      <div
        className={`booking-visual${micActive ? " is-listening" : ""}`}
        onPointerEnter={() => setMicActive(true)}
        onPointerLeave={() => setMicActive(false)}
        onPointerDown={() => setMicActive(true)}
        onClick={() => setMicActive(true)}
        onFocus={() => setMicActive(true)}
        onBlur={() => setMicActive(false)}
      >
        <span className="eyebrow">{b.visualEyebrow}</span>
        <ArtScene
          src="/assets/generated/live-microphone.webp"
          className="booking-sculpture"
        />
        <span className="live-stamp">LIVE / ON STAGE</span>
        <AudioLines size={36} strokeWidth={1} />
        <BookingVoiceRail
          sectionRef={sectionRef}
          micActive={micActive}
          levelsRef={levelsRef}
          onPlayingChange={setBeatLive}
        />
      </div>
      <div className="booking-copy">
        <span className="eyebrow">{b.eyebrow}</span>
        <h2 id="booking-title">
          {titleLines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>
        <p className="booking-lead">{b.p1}</p>
        <p className="booking-body">{b.p2}</p>
        <button className="btn" onClick={() => open("booking")}>
          {b.cta} <ArrowUpRight size={17} />
        </button>
      </div>
    </section>
  );
}

export function DemoSubmissionSection({
  open,
}: {
  open: (k: FormKind) => void;
}) {
  const { t } = useLang();
  const d = t.demos;
  const [before, after] = d.titleBefore.split("\n");

  return (
    <section
      id="demos"
      className="section demo-section"
      aria-labelledby="demos-title"
    >
      <div className="demo-panel">
        <div>
          <span className="eyebrow">
            <i className="status-dot" /> {d.eyebrow}
          </span>
          <h2 id="demos-title">
            {before}
            <br />
            {after}
            <span>{d.titleAccent}</span>
          </h2>
          <p>
            {d.p1}
            <br className="desktop-break" /> {d.p2}
          </p>
        </div>
        <div className="demo-panel-right">
          <div className="role-tags">
            {d.roles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
          <div className="mini-steps">
            {d.steps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
          <button className="btn" onClick={() => open("demo")}>
            {d.cta} <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
