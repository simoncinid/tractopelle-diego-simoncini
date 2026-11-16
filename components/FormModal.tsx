'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { type FormKind, type Field } from '@/data/mockData';
import { formatDate, formatEuro, todayISO } from '@/lib/format';
import { lockPageScroll } from '@/lib/scrollLock';
import { trapDialogFocus } from '@/lib/dialog';
import { useLang } from '@/components/LanguageProvider';

export default function FormModal({ kind, onClose }: { kind: FormKind; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState(0);
  const [review, setReview] = useState(false);
  const [done, setDone] = useState(false);
  const { t, lang } = useLang();
  const m = t.modal;
  const config = t.forms[kind];
  const visible = config.fields.filter((f) => kind !== 'demo' || f.stage === stage);

  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    const el = dialog.current;
    el?.showModal();
    document.getElementById("modal-title")?.focus();
    const releaseScroll = lockPageScroll();
    return () => {
      el?.close();
      releaseScroll();
      previous.current?.focus({ preventScroll: true });
    };
  }, []);

  function valid(fields: Field[]) {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const value = (values[f.name] || '').trim();
      if (!value && !f.optional) next[f.name] = m.errors.required;
      else if (value && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        next[f.name] = m.errors.email;
      else if (value && f.type === 'url') {
        try {
          const u = new URL(value);
          if (!['https:', 'http:'].includes(u.protocol) || !u.hostname.includes('.')) throw Error();
        } catch {
          next[f.name] = m.errors.url;
        }
      } else if (
        value &&
        f.type === 'number' &&
        (!Number.isFinite(Number(value)) || Number(value) < 1 || !Number.isInteger(Number(value)))
      )
        next[f.name] = m.errors.number;
      else if (value && f.type === 'date' && value < todayISO())
        next[f.name] = m.errors.date;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      setTimeout(() => document.getElementById('field-' + Object.keys(next)[0])?.focus(), 0);
      return false;
    }
    return true;
  }

  function move() {
    if (!valid(visible)) return;
    if (kind === 'demo' && stage === 0) setStage(1);
    else setReview(true);
    dialog.current?.scrollTo(0, 0);
    setTimeout(() => document.getElementById('modal-title')?.focus(), 0);
  }

  function finish() {
    if (!valid(config.fields)) return;
    setValues({});
    setReview(false);
    setDone(true);
    dialog.current?.scrollTo(0, 0);
    setTimeout(() => document.getElementById('modal-title')?.focus(), 0);
  }

  return (
    <dialog
      ref={dialog}
      className="form-modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
        }
      }}
      onKeyDown={trapDialogFocus}
      aria-labelledby="modal-title"
      aria-describedby="modal-intro"
    >
      <div className="modal-head">
        <span className="eyebrow">{m.eyebrow}</span>
        <button className="icon-button" onClick={onClose} aria-label={m.close}>
          <X size={22} />
        </button>
      </div>
      {done ? (
        <div className="success" role="status">
          <span className="success-icon">
            <Check size={32} />
          </span>
          <h2 id="modal-title" tabIndex={-1}>
            {m.successTitle}
          </h2>
          <p id="modal-intro">{m.successIntro}</p>
          <p className="muted">{m.successMuted}</p>
          <button className="btn" onClick={onClose}>
            {m.successCta} <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <h2 id="modal-title" tabIndex={-1}>
            {review ? m.reviewTitle : config.title}
          </h2>
          <p id="modal-intro" className="muted">
            {config.intro}
          </p>
          <p className="demo-note">{m.demoNote}</p>
          {kind === 'demo' && (
            <ol className="steps" aria-label={m.stepsAria}>
              {m.steps.map((s, i) => (
                <li key={s} aria-current={(review ? 2 : stage) === i ? 'step' : undefined}>
                  <span>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          )}
          {review ? (
            <div>
              <dl className="recap">
                {config.fields.map((f) => (
                  <div key={f.name}>
                    <dt>{f.label}</dt>
                    <dd>{!values[f.name] ? m.empty : f.name === 'budget' ? formatEuro(values[f.name], lang) : f.type === 'date' ? formatDate(values[f.name], lang) : values[f.name]}</dd>
                  </div>
                ))}
              </dl>
              <div className="form-actions">
                <button className="btn ghost" onClick={() => { setReview(false); dialog.current?.scrollTo(0, 0); setTimeout(() => document.getElementById("modal-title")?.focus(), 0); }}>
                  <ArrowLeft size={16} /> {m.edit}
                </button>
                <button className="btn" onClick={finish}>
                  {m.confirm} <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                move();
              }}
            >
              <div className="form-grid">
                {visible.map((f) => (
                  <div className={f.wide ? 'field wide' : 'field'} key={f.name}>
                    <label htmlFor={'field-' + f.name}>
                      {f.label}
                      {f.optional ? <span>{m.optional}</span> : <span aria-hidden="true"> *</span>}
                    </label>
                    {f.options ? (
                      <select
                        id={'field-' + f.name}
                        name={f.name}
                        value={values[f.name] || ''}
                        required={!f.optional}
                        aria-invalid={!!errors[f.name]}
                        aria-describedby={errors[f.name] ? 'error-' + f.name : undefined}
                        onChange={(e) => {
                          if (f.type === 'number' && !/^\d*$/.test(e.target.value)) return;
                          setValues({ ...values, [f.name]: e.target.value });
                        }}
                      >
                        <option value="">{m.choose}</option>
                        {f.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        id={'field-' + f.name}
                        name={f.name}
                        rows={4}
                        maxLength={2000}
                        value={values[f.name] || ''}
                        required={!f.optional}
                        aria-invalid={!!errors[f.name]}
                        aria-describedby={errors[f.name] ? 'error-' + f.name : undefined}
                        onChange={(e) => {
                          if (f.type === 'number' && !/^\d*$/.test(e.target.value)) return;
                          setValues({ ...values, [f.name]: e.target.value });
                        }}
                      />
                    ) : (
                      <input
                        id={'field-' + f.name}
                        name={f.name}
                        type={f.type === 'number' ? 'text' : f.type || 'text'}
                        inputMode={f.type === 'number' ? 'numeric' : undefined}
                        lang={lang}
                        pattern={f.type === 'number' ? '[0-9]*' : undefined}
                        min={f.type === 'number' ? 1 : undefined}
                        maxLength={500}
                        placeholder={f.placeholder}
                        value={values[f.name] || ''}
                        required={!f.optional}
                        aria-invalid={!!errors[f.name]}
                        aria-describedby={errors[f.name] ? 'error-' + f.name : undefined}
                        onChange={(e) => {
                          if (f.type === 'number' && !/^\d*$/.test(e.target.value)) return;
                          setValues({ ...values, [f.name]: e.target.value });
                        }}
                      />
                    )}
                    {f.type === 'date' && f.optional && <p className="required-note">{lang === 'fr' ? 'Je ne sais pas encore : laissez la date vide.' : 'Non lo so ancora: lascia la data vuota.'}</p>}
                    {errors[f.name] && (
                      <p className="field-error" id={'error-' + f.name}>
                        {errors[f.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="required-note">{m.required}</p>
              <div className="form-actions">
                {kind === 'demo' && stage === 1 && (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      dialog.current?.scrollTo(0, 0);
                      setTimeout(() => document.getElementById("modal-title")?.focus(), 0);
                      setStage(0);
                      setErrors({});
                    }}
                  >
                    <ArrowLeft size={16} /> {m.back}
                  </button>
                )}
                <button className="btn" type="submit">
                  {kind === 'demo' && stage === 0 ? m.continue : m.review} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </dialog>
  );
}
