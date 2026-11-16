/**
 * UX / visual / functional audit for http://localhost:3000/
 * Does NOT modify application source. Writes screenshots + report.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.TEST_URL || "http://localhost:3000";
const OUT = path.resolve("audit-screenshots");
const REPORT = path.resolve("AUDIT_UX_REPORT.md");

/** Avoid matching the always-present hidden mobile-menu <dialog>. */
const OPEN_MODAL = ".ai-modal[open], dialog.form-modal[open], dialog.form-modal";
const WORK_MODAL = ".ai-modal[open], .ai-modal, dialog.form-modal[open], dialog.form-modal";

const findings = [];
const jsErrors = [];
const consoleErrors = [];
const failedRequests = [];
const networkLog = [];
const notes = [];

function addFinding({ problem, screen, severity, expected, fix, area = "Generale" }) {
  findings.push({ problem, screen, severity, expected, fix, area });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function shot(page, rel, fullPage = false) {
  const file = path.join(OUT, rel);
  await ensureDir(path.dirname(file));
  await page.screenshot({ path: file, fullPage, animations: "disabled" });
  return rel;
}

async function settle(page, ms = 450) {
  await page.waitForTimeout(ms);
}

async function checkOverflow(page, label) {
  const result = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const scrollW = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (r.right > docW + 2) {
        offenders.push({
          cls: String(el.className || el.tagName).slice(0, 80),
          overflow: Math.round(r.right - docW),
        });
      }
    });
    return {
      docW,
      scrollW,
      overflowBy: scrollW - docW,
      offenders: offenders.slice(0, 12),
    };
  });
  if (result.overflowBy > 1) {
    addFinding({
      area: "Layout",
      problem: `Overflow orizzontale (${result.overflowBy}px) — ${label}`,
      screen: label,
      severity: "Alta",
      expected: "Nessuno scroll orizzontale; larghezza = viewport",
      fix: `Clippare o ridimensionare: ${
        result.offenders.map((o) => o.cls).join(", ") || "elemento non identificato"
      }`,
    });
  }
  return result;
}

async function checkMissingImages(page, label) {
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
      .slice(0, 20),
  );
  if (broken.length) {
    addFinding({
      area: "Media",
      problem: `Immagini non caricate (${broken.length}) — ${label}`,
      screen: label,
      severity: "Alta",
      expected: "Tutte le immagini visibili e caricate",
      fix: `Verificare path/asset: ${broken.slice(0, 5).join(", ")}`,
    });
  }
  return broken;
}

async function checkCutText(page, label) {
  const cut = await page.evaluate(() => {
    const out = [];
    const selectors = "h1,h2,h3,p,button,a,.eyebrow,.btn,label,.path-card,.ai-intro h2";
    document.querySelectorAll(selectors).forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      const overflowed =
        el.scrollWidth > el.clientWidth + 2 ||
        (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1);
      if (overflowed && el.textContent?.trim()) {
        out.push({
          text: el.textContent.trim().slice(0, 60),
          tag: el.tagName,
          cls: String(el.className || "").slice(0, 40),
        });
      }
    });
    return out.slice(0, 15);
  });
  if (cut.length) {
    addFinding({
      area: "Tipografia",
      problem: `Testi potenzialmente tagliati (${cut.length}) — ${label}`,
      screen: label,
      severity: "Media",
      expected: "Testi interamente leggibili senza clipping involontario",
      fix: `Rivedere layout/overflow per: ${cut
        .slice(0, 3)
        .map((c) => `"${c.text}"`)
        .join("; ")}`,
    });
  }
  return cut;
}

async function closeAnyModal(page) {
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator(OPEN_MODAL).count())) break;
    await page.keyboard.press("Escape");
    await settle(page, 250);
  }
  if (await page.locator(OPEN_MODAL).count()) {
    const close = page.locator(`${OPEN_MODAL} .icon-button, ${OPEN_MODAL} button[aria-label]`).first();
    if (await close.count()) await close.click().catch(() => {});
    await settle(page, 250);
  }
}

async function waitWorkModal(page, timeout = 10000) {
  await page.locator(WORK_MODAL).first().waitFor({ state: "visible", timeout });
}

async function waitOpenModal(page, timeout = 10000) {
  await page.locator(OPEN_MODAL).first().waitFor({ state: "visible", timeout });
}

async function fillVisibleFields(page, data) {
  const fields = page.locator(
    `${OPEN_MODAL} input:not([type=hidden]):not([type=checkbox]):not([type=radio]), ${OPEN_MODAL} textarea, ${OPEN_MODAL} select`,
  );
  const count = await fields.count();
  for (let i = 0; i < count; i++) {
    const field = fields.nth(i);
    if (!(await field.isVisible().catch(() => false))) continue;
    const tag = await field.evaluate((el) => el.tagName.toLowerCase());
    const type = (await field.getAttribute("type")) || "";
    const name =
      (await field.getAttribute("name")) ||
      (await field.getAttribute("id")) ||
      "";
    const value =
      data[name] ||
      data[name.replace(/^field-/, "")] ||
      (type === "email"
        ? data.email
        : type === "url"
          ? data.url
          : type === "date"
            ? data.date
            : type === "number"
              ? data.number
              : data.text);
    if (tag === "select") {
      const options = await field.locator("option").allTextContents();
      const pick =
        options.find((o) => o && !/selez|choisir|select/i.test(o)) || options[1];
      if (pick) {
        await field.selectOption({ label: pick }).catch(async () => {
          await field.selectOption({ index: 1 }).catch(() => {});
        });
      }
    } else {
      await field.fill(String(value ?? "Demo Tractopelle")).catch(() => {});
    }
  }
}

async function clickPrimaryInModal(page) {
  const btn = page.locator(`${OPEN_MODAL} button.btn`).first();
  if (await btn.count()) {
    await btn.click();
    await settle(page, 400);
    return true;
  }
  return false;
}

async function openClassicFromCta(page, sectionSelector) {
  await closeAnyModal(page);
  await page.locator(`${sectionSelector} button.btn`).first().click();
  await waitWorkModal(page);
  if (await page.locator(".ai-classic").count()) {
    await page.locator(".ai-classic").click();
    await waitOpenModal(page);
    return "classic";
  }
  // Already classic form-modal
  if (await page.locator("dialog.form-modal[open], dialog.form-modal").count()) {
    return "classic";
  }
  return "ai";
}

async function auditClassicForm(page, kind, openAction, phases) {
  notes.push(`\n### Flusso classic form: ${kind}`);
  await closeAnyModal(page);
  try {
    await openAction();
    await waitOpenModal(page);
  } catch (e) {
    addFinding({
      area: `Form ${kind}`,
      problem: `Impossibile aprire il form classic: ${e.message}`,
      screen: `flows/${kind}-open-failed.png`,
      severity: "Alta",
      expected: "Apertura modale form demo",
      fix: "Verificare CTA e fallback «Preferisco il modulo»",
    });
    await shot(page, `flows/${kind}-open-failed.png`);
    await closeAnyModal(page);
    return;
  }

  const openShot = await shot(page, `flows/${kind}-01-open.png`);
  phases.push({ phase: "Apertura", screen: openShot });

  await clickPrimaryInModal(page);
  const errCount = await page
    .locator(`${OPEN_MODAL} .error, ${OPEN_MODAL} .field-error, ${OPEN_MODAL} [aria-invalid=true]`)
    .count();
  const emptyShot = await shot(page, `forms/${kind}-empty-validation.png`);
  phases.push({ phase: "Validazione vuota", screen: emptyShot, errors: errCount });
  if (errCount === 0 && (await page.locator(OPEN_MODAL).count())) {
    addFinding({
      area: `Form ${kind}`,
      problem: "Submit a vuoto non mostra errori di validazione evidenti",
      screen: emptyShot,
      severity: "Media",
      expected: "Messaggi di errore sui campi obbligatori",
      fix: "Esporre errori accessibili (aria-invalid / testo errore) su submit vuoto",
    });
  } else if (errCount > 0) {
    notes.push(`- Validazione vuota OK (${errCount} errori) — ${emptyShot}`);
  }

  await fillVisibleFields(page, {
    email: "non-valida",
    url: "not-a-url",
    date: "2020-01-01",
    number: "0",
    text: "x",
  });
  await clickPrimaryInModal(page);
  const invalidShot = await shot(page, `forms/${kind}-invalid.png`);
  phases.push({ phase: "Dati non validi", screen: invalidShot });

  const valid = {
    email: "demo.partner@example.com",
    url: "https://example.com/progetto-demo",
    date: "2027-06-15",
    number: "800",
    text: "Proposta dimostrativa Tractopelle — nessun invio reale.",
    company: "Studio Demo SRL",
    contact: "Alex Demo",
    organizer: "Alex Demo",
    city: "Milano",
    country: "Italia",
    name: "Alex Demo",
    period: "primavera 2027",
    budget: "5.000–10.000 €",
    description: "Brief dimostrativo per audit UX. Nessun dato reale.",
    capacity: "800",
  };

  await closeAnyModal(page);
  try {
    await openAction();
    await waitOpenModal(page);
  } catch {
    await closeAnyModal(page);
    return;
  }

  for (let step = 0; step < 5; step++) {
    await fillVisibleFields(page, valid);
    const stepShot = await shot(page, `flows/${kind}-step-${step + 1}.png`);
    phases.push({ phase: `Compilazione step ${step + 1}`, screen: stepShot });

    const firstInput = page
      .locator(`${OPEN_MODAL} input[type=text], ${OPEN_MODAL} input:not([type])`)
      .first();
    if (await firstInput.count()) {
      const before = await firstInput.inputValue().catch(() => "");
      await page.keyboard.press("Tab");
      await settle(page, 150);
      const after = await firstInput.inputValue().catch(() => "");
      if (before && after !== before) {
        addFinding({
          area: `Form ${kind}`,
          problem: "Valore campo perso dopo Tab/blur",
          screen: stepShot,
          severity: "Alta",
          expected: "I valori restano dopo navigazione tra campi",
          fix: "Controllare stato controllato del form / key sui campi",
        });
      }
    }

    if (await page.locator(`${OPEN_MODAL} .success`).count()) {
      const doneShot = await shot(page, `flows/${kind}-success.png`);
      phases.push({ phase: "Successo simulato", screen: doneShot });
      break;
    }

    await clickPrimaryInModal(page);
    await settle(page, 500);

    const onReview = await page
      .locator(OPEN_MODAL)
      .evaluate((el) =>
        /riepilogo|récapitulatif|review|conferma la simulazione|confirmer/i.test(
          el.innerText,
        ),
      )
      .catch(() => false);

    if (onReview) {
      const reviewShot = await shot(page, `flows/${kind}-review.png`);
      phases.push({ phase: "Riepilogo", screen: reviewShot });
      await clickPrimaryInModal(page);
      await settle(page, 500);
      if (await page.locator(`${OPEN_MODAL} .success`).count()) {
        const doneShot = await shot(page, `flows/${kind}-success.png`);
        phases.push({ phase: "Successo simulato", screen: doneShot });
      }
      break;
    }
  }

  if (!(await page.locator(OPEN_MODAL).count())) {
    try {
      await openAction();
      await waitOpenModal(page, 8000);
    } catch {
      /* ignore */
    }
  }
  if (await page.locator(OPEN_MODAL).count()) {
    await page.keyboard.press("Escape");
    await settle(page, 350);
    const still = await page.locator(OPEN_MODAL).count();
    const escShot = await shot(page, `modals/${kind}-after-esc.png`);
    if (still > 0) {
      addFinding({
        area: `Form ${kind}`,
        problem: "ESC non chiude la modale",
        screen: escShot,
        severity: "Alta",
        expected: "ESC chiude la dialog e restituisce il focus",
        fix: "Gestire onCancel / Escape su <dialog>",
      });
      await closeAnyModal(page);
    } else {
      notes.push(`- ESC chiude la modale ${kind} — ${escShot}`);
    }
  }
}

async function auditAiFlow(page, label, openAction) {
  notes.push(`\n### Flusso AI: ${label}`);
  await closeAnyModal(page);
  try {
    await openAction();
    await waitWorkModal(page);
  } catch (e) {
    addFinding({
      area: `AI ${label}`,
      problem: `Impossibile aprire TRACTO AI: ${e.message}`,
      screen: `flows/ai-${label}-open-failed.png`,
      severity: "Alta",
      expected: "Apertura dialog AI",
      fix: "Verificare CTA sezione",
    });
    await shot(page, `flows/ai-${label}-open-failed.png`);
    return;
  }

  const open = await shot(page, `flows/ai-${label}-01-open.png`);
  notes.push(`- Apertura AI — ${open}`);

  const suggestionButtons = page.locator(".ai-modal button").filter({
    hasText: /artista|produzione|creativo|artiste|production|projet/i,
  });
  if (await suggestionButtons.count()) {
    await shot(page, `flows/ai-${label}-02-choices.png`);
    await suggestionButtons.first().click();
    await settle(page, 1500);
    await shot(page, `flows/ai-${label}-03-after-choice.png`);
  } else if (await page.locator("#ai-input").count()) {
    await page.locator("#ai-input").fill(
      "Sono un artista demo, propongo un singolo hip hop per estate 2027. Link: https://example.com/demo-track",
    );
    const send = page.locator(".ai-composer button, .ai-modal form button[type=submit]").first();
    if (await send.count()) await send.click();
    await settle(page, 2500);
    await shot(page, `flows/ai-${label}-03-after-message.png`);
  }

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await settle(page, 200);

  if (await page.locator(".ai-classic").count()) {
    await shot(page, `flows/ai-${label}-04-has-classic-fallback.png`);
  }

  await page.keyboard.press("Escape");
  await settle(page, 400);
  const openStill = await page.locator(".ai-modal[open]").count();
  if (openStill) {
    addFinding({
      area: `AI ${label}`,
      problem: "ESC non chiude TRACTO AI",
      screen: `flows/ai-${label}-01-open.png`,
      severity: "Alta",
      expected: "ESC chiude il dialog AI",
      fix: "Allineare gestione cancel/Escape del dialog",
    });
    await closeAnyModal(page);
  } else {
    notes.push(`- ESC chiude AI ${label}`);
  }
}

async function auditLinksAndButtons(page) {
  notes.push("\n### Link e pulsanti");
  const items = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("a[href], button, [role=button]")];
    return nodes.map((el) => {
      const tag = el.tagName.toLowerCase();
      const href = el.getAttribute("href");
      const text = (el.innerText || el.getAttribute("aria-label") || "")
        .trim()
        .slice(0, 80);
      const disabled =
        el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
      return { tag, href, text, disabled, id: el.id || null };
    });
  });

  let dead = 0;
  for (const item of items) {
    if (item.disabled) continue;
    if (item.tag === "a" && (!item.href || item.href === "#")) {
      dead++;
      addFinding({
        area: "Navigazione",
        problem: `Link senza destinazione: "${item.text || "(vuoto)"}"`,
        screen: "viewport/desktop-1440.png",
        severity: "Media",
        expected: "Ogni link ha href utile (#sezione o URL)",
        fix: "Assegnare ancoraggio/URL o convertire in button",
      });
    }
  }
  notes.push(`- Controllati ${items.length} link/pulsanti; link vuoti: ${dead}`);

  const anchors = items.filter((i) => i.tag === "a" && i.href?.startsWith("#"));
  for (const a of anchors.slice(0, 16)) {
    const id = a.href.slice(1);
    const exists = await page.evaluate(
      (target) => Boolean(document.getElementById(target)),
      id,
    );
    if (!exists) {
      addFinding({
        area: "Navigazione",
        problem: `Ancora #${id} senza target nella pagina`,
        screen: "viewport/desktop-1440.png",
        severity: "Media",
        expected: `Esiste un elemento id="${id}"`,
        fix: "Allineare href e id di sezione",
      });
    }
  }
}

async function main() {
  await ensureDir(OUT);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    locale: "it-IT",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  page.on("pageerror", (e) => jsErrors.push(String(e.message || e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("request", (req) => {
    networkLog.push({
      method: req.method(),
      url: req.url(),
      resourceType: req.resourceType(),
    });
  });
  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      method: req.method(),
      error: req.failure()?.errorText || "failed",
    });
  });
  page.on("response", (res) => {
    if (res.status() >= 400) {
      failedRequests.push({
        url: res.url(),
        method: res.request().method(),
        error: `HTTP ${res.status()}`,
      });
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("tracto-lang", "it"));
  await page.reload({ waitUntil: "networkidle" });
  if (await page.locator('button:has-text("IT")').count()) {
    await page.locator('button:has-text("IT")').first().click().catch(() => {});
    await settle(page, 700);
  }

  // 1–2 screenshots
  for (const width of [1440, 768, 390]) {
    const height = width === 390 ? 844 : width === 768 ? 1024 : 900;
    await page.setViewportSize({ width, height });
    await settle(page, 500);
    await shot(page, `viewport/first-screen-${width}.png`, false);
    await shot(page, `fullpage/full-${width}.png`, true);
    await checkOverflow(page, `full-${width}`);
    await checkMissingImages(page, `full-${width}`);
    await checkCutText(page, `full-${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await settle(page, 300);
  await shot(page, "viewport/desktop-1440.png");
  await page.setViewportSize({ width: 390, height: 844 });
  await settle(page, 300);
  await shot(page, "viewport/mobile-390.png");

  // 3 mobile menu
  const menuBtn = page.locator(
    'button[aria-label*="menu" i], button[aria-label*="Menu"], button[aria-label*="Apri"]',
  );
  if (await menuBtn.count()) {
    await menuBtn.first().click();
    await settle(page, 400);
    await shot(page, "modals/mobile-menu-open.png");
    notes.push("- Menu mobile aperto — modals/mobile-menu-open.png");
    await page.keyboard.press("Escape");
    await settle(page, 300);
    if (await page.locator("dialog.mobile-menu[open]").count()) {
      const closeMenu = page.locator('button[aria-label*="Chiudi" i], button[aria-label*="close" i]');
      if (await closeMenu.count()) await closeMenu.first().click();
    }
  } else {
    notes.push("- Nessun pulsante menu mobile trovato");
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await settle(page, 400);
  await auditLinksAndButtons(page);

  const phases = { artists: [], collab: [], booking: [], liste: [], demos: [] };

  // Artisti
  notes.push("\n### Modulo Artisti");
  await page.locator("#artistes").scrollIntoViewIfNeeded().catch(async () => {
    await page.getByRole("heading", { name: /artisti/i }).first().scrollIntoViewIfNeeded();
  });
  await settle(page, 400);
  const artistsShot = await shot(page, "flows/artists-section.png");
  phases.artists.push({ phase: "Sezione roster", screen: artistsShot });
  const artistLinks = await page.locator(".artists-grid a, .artist-card a, a[href*='tractopellemusic.com']").count();
  notes.push(`- Link artisti rilevati: ${artistLinks} — ${artistsShot}`);

  // Collaborazioni AI + classic
  await page.locator("#collaborations").scrollIntoViewIfNeeded();
  await settle(page, 300);
  await auditAiFlow(page, "collaborazioni", async () => {
    await page.locator("#collaborations button.btn").first().click();
  });
  await auditClassicForm(
    page,
    "collaboration",
    async () => {
      const mode = await openClassicFromCta(page, "#collaborations");
      if (mode !== "classic") throw new Error("Fallback classic non disponibile");
    },
    phases.collab,
  );

  // Booking
  await page.locator("#booking").scrollIntoViewIfNeeded();
  await settle(page, 300);
  await auditAiFlow(page, "booking", async () => {
    await page.locator("#booking button.btn").first().click();
  });
  await auditClassicForm(
    page,
    "booking",
    async () => {
      const mode = await openClassicFromCta(page, "#booking");
      if (mode !== "classic") throw new Error("Fallback classic non disponibile");
    },
    phases.booking,
  );

  // Demos
  await page.locator("#demos").scrollIntoViewIfNeeded();
  await settle(page, 300);
  await auditAiFlow(page, "demos", async () => {
    await page.locator("#demos button.btn").first().click();
  });
  await auditClassicForm(
    page,
    "demo",
    async () => {
      const mode = await openClassicFromCta(page, "#demos");
      if (mode !== "classic") throw new Error("Fallback classic non disponibile");
    },
    phases.demos,
  );

  // La Liste / community (FormModal diretto)
  await page.locator(".community-section").scrollIntoViewIfNeeded();
  await settle(page, 300);
  await auditClassicForm(
    page,
    "community",
    async () => {
      await closeAnyModal(page);
      const btn = page
        .locator(".community-section button, footer button")
        .filter({ hasText: /aperture|liste|Ricevi|Restez|contact|ascolto/i });
      if (await btn.count()) await btn.first().click();
      else throw new Error("CTA La Liste non trovata");
      await waitOpenModal(page);
    },
    phases.liste,
  );

  // Network privacy
  const externalPosts = networkLog.filter((r) => {
    if (!["POST", "PUT", "PATCH"].includes(r.method)) return false;
    try {
      const u = new URL(r.url);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
      return true;
    } catch {
      return false;
    }
  });
  if (externalPosts.length) {
    addFinding({
      area: "Privacy / Demo",
      problem: `Rilevate ${externalPosts.length} richieste POST/PUT verso host non locali`,
      screen: "forms/",
      severity: "Alta",
      expected: "I form demo non inviano dati a servizi esterni",
      fix: externalPosts
        .slice(0, 5)
        .map((r) => r.url)
        .join(" | "),
    });
  } else {
    notes.push("- Nessuna POST esterna rilevata (form demo ok).");
  }
  const assistantPosts = networkLog.filter(
    (r) => r.method === "POST" && /\/api\/assistant/.test(r.url),
  );
  notes.push(`- POST same-origin /api/assistant: ${assistantPosts.length}`);

  if (jsErrors.length) {
    addFinding({
      area: "Runtime",
      problem: `Errori JavaScript di pagina: ${jsErrors.length}`,
      screen: "console",
      severity: "Alta",
      expected: "Nessun pageerror in navigazione demo",
      fix: jsErrors.slice(0, 3).join(" || "),
    });
  }

  const meaningfulFailed = failedRequests.filter(
    (f) =>
      !/favicon|sourcemap|\.map|hot-update|webpack|__nextjs/i.test(f.url),
  );
  if (meaningfulFailed.length) {
    addFinding({
      area: "Rete",
      problem: `Richieste fallite: ${meaningfulFailed.length}`,
      screen: "network",
      severity: "Media",
      expected: "Nessun 4xx/5xx su asset critici",
      fix: meaningfulFailed
        .slice(0, 5)
        .map((f) => `${f.error} ${f.url}`)
        .join(" | "),
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await checkOverflow(page, "final-desktop");

  await browser.close();

  const sevOrder = { Critica: 0, Alta: 1, Media: 2, Bassa: 3 };
  findings.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9));

  const md = [];
  md.push(`# Audit UX — Tractopelle Demo`);
  md.push("");
  md.push(`- **URL**: ${BASE}`);
  md.push(`- **Data**: ${new Date().toISOString()}`);
  md.push(`- **Tool**: Playwright`);
  md.push(`- **Screenshot**: cartella \`audit-screenshots/\``);
  md.push(`- **Codice sorgente**: non modificato`);
  md.push("");
  md.push(`## Sintesi`);
  md.push("");
  md.push(`| Gravità | Conteggio |`);
  md.push(`|--------|-----------|`);
  for (const s of ["Critica", "Alta", "Media", "Bassa"]) {
    md.push(`| ${s} | ${findings.filter((f) => f.severity === s).length} |`);
  }
  md.push(`| **Totale finding** | **${findings.length}** |`);
  md.push("");
  md.push(`### Runtime`);
  md.push(`- Pageerror JS: ${jsErrors.length}`);
  md.push(`- Console error: ${consoleErrors.length}`);
  md.push(`- Request failed / HTTP≥400 (filtrate): ${meaningfulFailed.length}`);
  md.push(`- POST esterne: ${externalPosts.length}`);
  md.push(`- POST \`/api/assistant\`: ${assistantPosts.length}`);
  md.push("");
  md.push(`## Screenshot acquisiti`);
  md.push("");
  md.push(`1. Full-page: \`fullpage/full-1440.png\`, \`full-768.png\`, \`full-390.png\``);
  md.push(`2. Primo schermo: \`viewport/first-screen-*.png\`, \`desktop-1440.png\`, \`mobile-390.png\``);
  md.push(`3. Menu/modali: \`modals/\``);
  md.push(`4. Flussi moduli: \`flows/\``);
  md.push(`5. Form validation: \`forms/\``);
  md.push("");
  md.push(`## Finding UX`);
  md.push("");
  if (!findings.length) {
    md.push("_Nessun problema bloccante rilevato automaticamente. Vedere note di flusso._");
    md.push("");
  }
  findings.forEach((f, i) => {
    md.push(`### ${i + 1}. [${f.severity}] ${f.problem}`);
    md.push("");
    md.push(`- **Area**: ${f.area}`);
    md.push(`- **Schermata di riferimento**: \`${f.screen}\``);
    md.push(`- **Gravità**: ${f.severity}`);
    md.push(`- **Comportamento atteso**: ${f.expected}`);
    md.push(`- **Correzione consigliata**: ${f.fix}`);
    md.push("");
  });
  md.push(`## Note di flusso (fasi documentate)`);
  md.push(notes.join("\n"));
  md.push("");
  md.push(`## Errori JS (raw)`);
  md.push("```");
  md.push(jsErrors.slice(0, 30).join("\n") || "(nessuno)");
  md.push("```");
  md.push("");
  md.push(`## Console errors (raw)`);
  md.push("```");
  md.push(consoleErrors.slice(0, 30).join("\n") || "(nessuno)");
  md.push("```");
  md.push("");
  md.push(`## Network failures (raw)`);
  md.push("```");
  md.push(
    meaningfulFailed
      .slice(0, 40)
      .map((f) => `${f.method} ${f.error} ${f.url}`)
      .join("\n") || "(nessuna)",
  );
  md.push("```");
  md.push("");
  md.push(`## Disclaimer`);
  md.push(
    "Audit automatico con Playwright. Alcuni finding su testi tagliati possono essere falsi positivi (ellipsis intenzionali). Nessuna correzione applicata al codice dell'app.",
  );

  await fs.writeFile(REPORT, md.join("\n"), "utf8");
  await fs.writeFile(
    path.join(OUT, "audit-data.json"),
    JSON.stringify(
      { findings, jsErrors, consoleErrors, failedRequests: meaningfulFailed, externalPosts, assistantPosts, notes, phases },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\nAudit complete.`);
  console.log(`Report: ${REPORT}`);
  console.log(`Screenshots: ${OUT}`);
  console.log(`Findings: ${findings.length}`);
}

main().catch(async (err) => {
  console.error(err);
  await fs.writeFile(
    REPORT,
    `# Audit UX — FALLITO\n\n\`\`\`\n${err?.stack || err}\n\`\`\`\n`,
    "utf8",
  );
  process.exit(1);
});
