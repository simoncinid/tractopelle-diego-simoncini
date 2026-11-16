import type { KeyboardEvent } from 'react';
export function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
  )).filter(el => el.getClientRects().length && !el.closest('[hidden]'));
  const first = nodes[0], last = nodes.at(-1);
  if (!first) { event.preventDefault(); return; }
  const active = document.activeElement as HTMLElement;
  if (event.shiftKey && (active === first || !nodes.includes(active))) {
    event.preventDefault(); last?.focus();
  } else if (!event.shiftKey && (active === last || !nodes.includes(active))) {
    event.preventDefault(); first.focus();
  }
}
