"use client";
import { useRef, useState } from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import Header from "@/components/Header";
import VisualEffects from "@/components/VisualEffects";
import Hero from "@/components/Hero";
import AudiencePaths from "@/components/AudiencePaths";
import ArtistsSection from "@/components/ArtistsSection";
import ReleasesSection from "@/components/ReleasesSection";
import {
  PartnershipsSection,
  BookingSection,
  DemoSubmissionSection,
} from "@/components/ProjectSections";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import AIAssistant, { AILauncher } from "@/components/AIAssistant";
import FormModal from "@/components/FormModal";
import type { FormKind } from "@/data/mockData";

export default function Home() {
  const opener = useRef<HTMLElement | null>(null);
  const close = () => { setModal(null); setTimeout(() => opener.current?.isConnected && opener.current.focus({ preventScroll: true }), 0); };
  const [modal, setModal] = useState<FormKind | null>(null);
  const [classic, setClassic] = useState(false);
  const open = (kind: FormKind) => {
    opener.current = document.activeElement as HTMLElement;
    setClassic(false);
    setModal(kind);
  };

  return (
    <LanguageProvider>
      <VisualEffects />
      <Header openDemo={() => open("demo")} />
      <main id="contenu">
        <Hero />
        <AudiencePaths open={open} />
        <ArtistsSection />
        <ReleasesSection />
        <PartnershipsSection open={open} />
        <BookingSection open={open} />
        <DemoSubmissionSection open={open} />
        <CommunitySection open={() => open("community")} />
      </main>
      <Footer open={open} />
      <AILauncher onClick={() => open("demo")} />
      {modal &&
        (modal === "community" || classic ? (
          <FormModal key={modal} kind={modal} onClose={close} />
        ) : (
          <AIAssistant
            key={modal}
            kind={modal}
            onClose={close}
            onFallback={(kind) => { if (kind) setModal(kind); setClassic(true); }}
          />
        ))}
    </LanguageProvider>
  );
}
