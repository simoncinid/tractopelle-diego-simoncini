import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(7000);
const errors = [],
  external = [],
  mutations = [];
const checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("request", (r) => {
  if (!r.url().startsWith(base) && !r.url().startsWith("data:"))
    external.push(r.url());
  if (!["GET", "HEAD"].includes(r.method())) mutations.push(r.url());
});
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
for (const width of [375, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(100);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Horizontal overflow at " + width,
  );
  assert(
    await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.every((i) => i.complete && i.naturalWidth > 0),
      ),
    "Missing image",
  );
  await page.screenshot({
    path: `screenshots/demo/home-${width}-full.png`,
    fullPage: true,
  });
    checks.push(`Layout ${width}px: no overflow, all images loaded`);
}
for (const id of [
  "artistes",
  "musique",
  "collaborations",
  "booking",
  "demos",
]) {
  await page.locator('.desktop-nav a[href="#' + id + '"]').click();
  await page.waitForTimeout(30);
  assert.equal(await page.evaluate(() => location.hash), "#" + id);
}
checks.push("All desktop anchor links");
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Ouvrir le menu" }).click();
assert(await page.locator(".mobile-menu").evaluate((el) => el.open));
await page.screenshot({ path: "screenshots/demo/mobile-menu.png" });
await page
  .getByRole("navigation", { name: "Navigation mobile" })
  .locator('a[href="#artistes"]')
  .click();
assert(!(await page.locator(".mobile-menu").evaluate((el) => el.open)));
await page.getByRole("button", { name: "Ouvrir le menu" }).click();
await page.keyboard.press("Escape");
assert(!(await page.locator(".mobile-menu").evaluate((el) => el.open)));
checks.push("Mobile menu, anchor navigation, Escape");
async function fill(name, value) {
  await page.locator("#field-" + name).fill(value);
}
async function select(name, value) {
  await page.locator("#field-" + name).selectOption({ label: value });
}
async function submit() {
  await page
    .getByRole("button", { name: "Voir le récapitulatif", exact: true })
    .click();
}
async function confirm() {
  await page.getByRole("button", { name: "Confirmer la simulation" }).click();
  assert(
    await page
      .getByRole("status")
      .getByText("Aucune information", { exact: false })
      .isVisible(),
  );
  await page.getByRole("button", { name: "Revenir au site" }).click();
}
// Partnership: invalid fields, email, optional fields, recap and focus containment.
await page.locator("#collaborations button").click();
await submit();
assert((await page.locator("[aria-invalid=true]").count()) > 0);
await fill("company", "Studio Démo");
await fill("contact", "Contact Test");
await fill("email", "incorrect");
await select("type", "Licence musicale");
await fill("period", "Printemps 2027");
await fill("description", "Projet fictif pour vérifier la démonstration.");
await submit();
assert(await page.getByText("Saisissez une adresse email valide.").isVisible());
await fill("email", "demo@example.com");
await page.screenshot({ path: "screenshots/demo/collaboration-mobile.png" });
for (let i = 0; i < 20; i++) {
  await page.keyboard.press("Tab");
  assert(
    await page.evaluate(() =>
      document.querySelector(".form-modal").contains(document.activeElement),
    ),
  );
}
await submit();
assert(
  await page.getByText("Votre récapitulatif.", { exact: true }).isVisible(),
);
await page.getByRole("button", { name: "Modifier", exact: true }).click();
assert.equal(await page.locator("#field-company").inputValue(), "Studio Démo");
await submit();
await confirm();
checks.push(
  "Collaboration: required fields, email, focus containment, edit, recap, simulation",
);
// Reopen: no retained personal state; Escape returns focus.
const trigger = page.locator("#collaborations button");
await trigger.click();
assert.equal(await page.locator("#field-company").inputValue(), "");
await page.keyboard.press("Escape");
assert(await trigger.evaluate((el) => el === document.activeElement));
checks.push("Escape, focus restoration, state reset");
await page.locator("#booking button").click();
await submit();
assert((await page.locator("[aria-invalid=true]").count()) > 0);
for (const [k, v] of Object.entries({
  organizer: "Organisateur test",
  company: "Structure Démo",
  email: "booking@example.com",
  city: "Monaco",
  country: "Monaco",
  date: "2027-05-20",
  capacity: "500",
  budget: "5000 €",
}))
  await fill(k, v);
await select("type", "Festival");
await select("artist", "MC Pao");
await fill("capacity", "-1");
await submit();
assert(
  await page
    .getByText("Indiquez un nombre entier supérieur à zéro.")
    .isVisible(),
);
await fill("capacity", "500");
await submit();
await confirm();
checks.push("Booking: required fields, capacity validation, recap, simulation");
await page.locator("#demos button").click();
await page.getByRole("button", { name: "Continuer", exact: true }).click();
assert((await page.locator("[aria-invalid=true]").count()) > 0);
await fill("name", "Artiste Démo");
await fill("email", "artiste@example.com");
await fill("city", "Nice");
await select("role", "Producteur");
await page.getByRole("button", { name: "Continuer", exact: true }).click();
await fill("url", "javascript:alert(1)");
await fill("description", "Présentation fictive de mon projet.");
await submit();
assert(
  await page.getByText("Ajoutez un lien complet", { exact: false }).isVisible(),
);
await fill("url", "https://example.com/projet-demo");
await page.getByRole("button", { name: "Retour", exact: true }).click();
assert.equal(await page.locator("#field-name").inputValue(), "Artiste Démo");
await page.getByRole("button", { name: "Continuer", exact: true }).click();
await submit();
await page.screenshot({
  path: "screenshots/demo/project-recap-mobile.png",
  fullPage: true,
});
await confirm();
checks.push(
  "Artistic project: three stages, role, URL validation, back preserves data, recap, simulation",
);
await page.locator("#la-liste button").click();
await fill("email", "invalid");
await submit();
assert(await page.getByText("Saisissez une adresse email valide.").isVisible());
await fill("email", "community@example.com");
await submit();
await confirm();
checks.push("Community: email validation and simulation");
await page.setViewportSize({ width: 1440, height: 1000 });
for (const id of [
  "parcours",
  "artistes",
  "musique",
  "collaborations",
  "booking",
  "demos",
  "la-liste",
])
  await page
    .locator("#" + id)
    .screenshot({ path: `screenshots/demo/section-${id}.png` });
await page.locator("#collaborations button").click();
await page.screenshot({ path: "screenshots/demo/collaboration-desktop.png" });
await page.keyboard.press("Escape");
assert.equal(external.length, 0, "Unexpected external requests");
assert.equal(mutations.length, 0, "Data transmitted");
assert.equal(errors.length, 0, "Browser errors: " + JSON.stringify(errors));
assert(
  await page.evaluate(
    () => localStorage.length === 0 && sessionStorage.length === 0,
  ),
  "Unexpected storage",
);
assert.equal((await context.cookies()).length, 0, "Unexpected cookies");
checks.push("No external requests, POSTs, storage, cookies or console errors");
const report = {
  date: "2026-11-16",
  browser: "Chrome via Playwright",
  checks,
  errors,
  external,
  mutations,
};
await fs.writeFile(
  "screenshots/demo/verification.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
