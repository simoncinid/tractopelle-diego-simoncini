"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Sparkles,
  X,
  RotateCcw,
} from "lucide-react";
import { lockPageScroll } from '@/lib/scrollLock';
import { trapDialogFocus } from '@/lib/dialog';
import { useLang } from "@/components/LanguageProvider";
import { assistantCopy } from "@/data/assistantCopy";
import {
  emptyLead,
  type ChatMessage,
  type Lead,
} from "@/lib/assistant";
import type { FormKind } from "@/data/mockData";
import { assistantDemos, type DemoScenario } from "@/data/assistantDemos";
import { formatDate, formatEuro } from "@/lib/format";
type Kind = Exclude<FormKind, "community">;
function Orb({ busy = false }: { busy?: boolean }) {
  return (
    <div className={`ai-orb${busy ? " is-thinking" : ""}`} aria-hidden="true">
      <span className="ai-orb-ring" />
      <span className="ai-orb-ring second" />
      <span className="ai-orb-core" />
      <span className="ai-orb-glint" />
    </div>
  );
}
export function AILauncher({ onClick }: { onClick: () => void }) {
  const { lang } = useLang();
  return (
    <button className="ai-launcher" onClick={onClick} aria-haspopup="dialog">
      <span className="launcher-symbol">
        <Sparkles size={19} />
      </span>
      <span>
        {assistantCopy[lang].launcher}
        <small>TRACTO AI</small>
      </span>
      <ArrowRight size={16} />
    </button>
  );
}
export default function AIAssistant({
  kind: initialKind,
  onClose,
  onFallback,
}: {
  kind: Kind;
  onClose: () => void;
  onFallback: (kind?: Kind) => void;
}) {
  const { lang } = useLang();
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [turn, setTurn] = useState(0);
  const kind = scenario?.kind || initialKind;
  const c = assistantCopy[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const lead: Lead = scenario && turn === scenario.users.length ? scenario.lead : { ...emptyLead };
  const ready = !!lead.summary;
  const [stage, setStage] = useState<"chat" | "contact" | "done">("chat");
  const [contact, setContact] = useState({
    name: "",
    email: "",
    summary: "",
    consent: false,
  });
  const [validation, setValidation] = useState("");
  function updateContact(patch: Partial<typeof contact>) {
    setContact((current) => ({ ...current, ...patch }));
    setValidation("");
  }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const releaseScroll = lockPageScroll();
    dialog.current?.showModal();
    document.getElementById("ai-title")?.focus();
    return () => {
      releaseScroll();
      dialog.current?.close();
      previous?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    log.current?.lastElementChild?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [messages]);
  function selectDemo(selected: DemoScenario) {
    setScenario(selected);
    setTurn(1);
    setMessages([{ role: "user", content: selected.users[0] }, { role: "assistant", content: selected.replies[0] }]);
  }
  function advanceDemo() {
    if (!scenario || turn >= scenario.users.length) return;
    setMessages(current => [...current, { role: "user", content: scenario.users[turn] }, { role: "assistant", content: scenario.replies[turn] }]);
    setTurn(turn + 1);
  }
  function complete(event: FormEvent) {
    event.preventDefault();
    if (
      !contact.name.trim() ||
      !contact.summary.trim() ||
      !/^\S+@\S+\.\S+$/.test(contact.email)
    ) {
      setValidation(c.required);
      return;
    }
    if (!contact.consent) {
      setValidation(c.consentError);
      return;
    }
    setContact({ name: "", email: "", summary: "", consent: false });
    setMessages([]);
    setStage("done");
    setTimeout(() => document.getElementById("ai-title")?.focus(), 0);
  }
  function openContact() {
    setContact((v) => ({ ...v, summary: v.summary || lead.summary }));
    setStage("contact");
    setTimeout(() => document.getElementById("contact-name")?.focus(), 0);
  }
  function restart() {
    setScenario(null);
    setTurn(0);
    setMessages([]);
    setContact({ name: "", email: "", summary: "", consent: false });
    setValidation("");
    setStage("chat");
    setTimeout(() => { dialog.current?.scrollTo(0, 0); document.getElementById("ai-title")?.focus(); }, 0);
  }

  return (
    <dialog
      ref={dialog}
      className="ai-modal"
      data-stage={stage}
      aria-labelledby="ai-title"
      aria-describedby="ai-privacy"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={trapDialogFocus}
    >
      <div className="ai-topbar">
        <span>
          <i /> TRACTO <b>AI</b>
          <small>
            {" "}
            /{" "}
            {kind === "booking"
              ? "LIVE"
              : kind === "collaboration"
                ? "COLLAB"
                : "CREATIVE"}
          </small>
        </span>
        <div>
          <button className="ai-classic" onClick={() => onFallback(kind)}>
            {c.form}
          </button>
          <button className="ai-reset icon-button" onClick={restart} aria-label={lang === "fr" ? "Effacer et choisir une autre démo" : "Pulisci e scegli un’altra demo"} title={c.restart}><RotateCcw size={14} /></button>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={c.close}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {stage === "done" ? (
        <div className="ai-success" role="status">
          <Orb />
          <span className="ai-success-check">
            <CheckCheck size={26} />
          </span>
          <h2 id="ai-title" tabIndex={-1}>
            {c.successTitle}
          </h2>
          <p>{c.success}</p>
          <button className="btn" onClick={onClose}>
            {c.finish}
            <ArrowRight size={17} />
          </button>
          <p id="ai-privacy" className="ai-privacy">
            {c.privacy}
          </p>
        </div>
      ) : (
        <div className="ai-layout">
          <aside className="ai-intro">
            <span className="eyebrow">{c.badge}</span>
            <h2 id="ai-title" tabIndex={-1}>
              {stage === "contact" ? c.contactTitle : c.title}
            </h2>
            <p>{stage === "contact" ? c.contactIntro : c.intro}</p>
            <p className="ai-demo-disclosure">{lang === "fr" ? "Quatre conversations fictives, sans IA connectée. Aucun message transmis." : "Quattro conversazioni fittizie, senza AI collegata. Nessun messaggio trasmesso."}</p>
            <Orb />
            <ol className="ai-steps">
              {c.steps.map((s, i) => (
                <li
                  key={s}
                  aria-current={
                    (stage === "contact" ? 2 : ready ? 1 : 0) === i
                      ? "step"
                      : undefined
                  }
                >
                  <span>0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p id="ai-privacy" className="ai-privacy">
              {c.privacy}
            </p>
          </aside>
          <div className="ai-workspace">
            {stage === "chat" ? (
              <>
                <div
                  className="ai-thread"
                  ref={log}
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions"
                  aria-label={c.identity}
                >
                  <div className="ai-message assistant">
                    <span className="ai-message-label">
                      <Sparkles size={12} />
                      {c.name}
                    </span>
                    <p>{scenario ? scenario.title : (lang === "fr" ? "Choisissez une conversation de démonstration." : "Scegli una conversazione dimostrativa.")}</p>
                  </div>
                  {messages.map((message, i) => (
                    <div key={i} className={"ai-message " + message.role}>
                      <span className="ai-message-label">
                        {message.role === "assistant" ? (
                          <>
                            <Sparkles size={12} />
                            {c.name}
                          </>
                        ) : (
                          c.you
                        )}
                      </span>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
                {!scenario && <div className="ai-demo-picker" aria-label={lang === "fr" ? "Conversations de démonstration" : "Conversazioni demo"}>
                  {assistantDemos[lang].map((demo, index) => <button key={demo.id} data-demo-id={demo.id} onClick={() => selectDemo(demo)}><span>0{index + 1}</span>{demo.title}<ArrowRight size={16} /></button>)}
                </div>}
                {scenario && !ready && <div className="ai-suggestions"><button data-demo-next onClick={advanceDemo}>{scenario.users[turn]}<ArrowRight size={13} /></button></div>}
                {lead.summary && (
                  <section
                    className={"ai-brief" + (ready ? " ready" : "")}
                    aria-label={c.brief}
                  >
                    <div>
                      <span className="eyebrow">{c.brief}</span>
                      <span className="ai-brief-status">
                        {ready ? <Check size={12} /> : <i />}
                        {ready ? c.ready : c.draft}
                      </span>
                    </div>
                    <p>{lead.summary}</p>
                    <dl>
                      {Object.entries(c.labels).map(
                        ([key, label]) =>
                          lead[key as keyof Lead] && (
                            <div key={key}>
                              <dt>{label}</dt>
                              <dd>{key === "budget" ? formatEuro(lead.budget, lang) : key === "timeframe" ? formatDate(lead.timeframe, lang) : lead[key as keyof Lead]}</dd>
                            </div>
                          ),
                      )}
                    </dl>
                    <button
                      className="btn"
                      disabled={!ready}
                      onClick={openContact}
                    >
                      {c.contact}
                      <ArrowRight size={16} />
                    </button>
                  </section>
                )}

              </>
            ) : (
              <form className="ai-contact" noValidate onSubmit={complete}>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setStage("chat")}
                >
                  <ArrowLeft size={14} />
                  {c.back}
                </button>
                <div className="ai-contact-heading">
                  <span className="eyebrow">{c.ready}</span>
                  <h3>{c.contact}</h3>
                </div>
                <div className="field">
                  <label htmlFor="contact-brief">{c.summary}</label>
                  <textarea
                    id="contact-brief"
                    rows={3}
                    maxLength={2000}
                    required
                    value={contact.summary}
                    onChange={(e) => updateContact({ summary: e.target.value })}
                  />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="contact-name">{c.nameLabel}</label>
                    <input
                      id="contact-name"
                      autoComplete="off"
                      maxLength={120}
                      required
                      value={contact.name}
                      onChange={(e) => updateContact({ name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">{c.email}</label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="off"
                      maxLength={200}
                      required
                      value={contact.email}
                      onChange={(e) => updateContact({ email: e.target.value })}
                    />
                  </div>
                </div>
                <label className="ai-consent">
                  <input
                    type="checkbox"
                    checked={contact.consent}
                    onChange={(e) =>
                      updateContact({ consent: e.target.checked })
                    }
                  />
                  <span>{c.consent}</span>
                </label>
                {validation && (
                  <p className="ai-contact-error" role="alert">
                    {validation}
                  </p>
                )}
                <button className="btn" type="submit">
                  {c.confirm}
                  <Check size={17} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
