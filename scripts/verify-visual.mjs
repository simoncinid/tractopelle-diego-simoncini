import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [],
  requests = [];
const checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("request", (r) => {
  if (!r.url().startsWith(base) || !["GET", "HEAD"].includes(r.method()))
    requests.push({ url: r.url(), method: r.method() });
});
await page.goto(base, { waitUntil: "networkidle" });
for (const lang of ["it", "fr"]) {
  await page.evaluate(
    (lang) => localStorage.setItem("tracto-lang", lang),
    lang,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(
    (lang) => document.documentElement.lang === lang,
    lang,
  );
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 650) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(800);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow ${lang}/${width}`,
    );
    await page.waitForFunction(() =>
      Array.from(document.images).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    assert(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.every((i) => i.complete && i.naturalWidth > 0),
        ),
      "Missing asset",
    );
    assert(
      (await page.locator(".art-scene").count()) === 3,
      "Missing generated sculpture",
    );
    const heading = await page.locator("#hero-title").evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { right: r.right, width: innerWidth };
    });
    assert(heading.right <= heading.width, "Title outside viewport");
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `screenshots/futuristic/home-${lang}-${width}-full.png`,
        fullPage: true,
      });
    checks.push(
      `${lang} ${width}px: all images loaded, 3 sculptures, no horizontal overflow`,
    );
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator("#accueil").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator(".hero-sculpture").hover({ position: { x: 320, y: 100 } });
await page.waitForTimeout(550);
assert(
  await page.locator(".hero-sculpture .art-scene-object").evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return Math.abs(m.m13) > 0.001 || Math.abs(m.m23) > 0.001;
  }),
  "Art does not tilt",
);
await page.screenshot({ path: "screenshots/futuristic/hero-hover.png" });
const card = page.locator(".artist-card").first();
await card.hover({ position: { x: 120, y: 50 } });
await page.waitForTimeout(450);
assert.equal(await card.getAttribute("data-pointer"), "true");
assert((await card.getAttribute("style")).includes("--mx"));
await page
  .locator("#artistes")
  .screenshot({ path: "screenshots/futuristic/artists-hover.png" });
await page.locator("#collaborations").scrollIntoViewIfNeeded();
await page.waitForTimeout(850);
await page.locator(".collab-sculpture").hover({ position: { x: 200, y: 70 } });
await page.waitForTimeout(450);
await page
  .locator("#collaborations")
  .screenshot({ path: "screenshots/futuristic/collaborations.png" });
await page.locator("#booking").scrollIntoViewIfNeeded();
await page.waitForTimeout(850);
await page
  .locator("#booking")
  .screenshot({ path: "screenshots/futuristic/booking.png" });
await page.locator("#collaborations button").click();
assert(await page.locator(".form-modal").evaluate((e) => e.open));
await page.keyboard.press("Escape");
assert(!(await page.locator(".form-modal").count()));
checks.push(
  "Mouse: sculpture perspective, card spotlight, hover; collaboration modal and Escape",
);
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Ouvrir le menu" }).click();
await page.locator('.mobile-menu a[href="#booking"]').click();
assert(!(await page.locator(".mobile-menu").evaluate((e) => e.open)));
checks.push("Mobile menu and booking navigation");
await page.emulateMedia({ reducedMotion: "reduce" });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator("#accueil").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.locator(".hero-sculpture").hover({ position: { x: 320, y: 100 } });
await page.waitForTimeout(400);
assert.equal(
  await page
    .locator(".hero-sculpture .art-scene-object")
    .evaluate((e) => getComputedStyle(e).transform),
  "none",
);
assert(await page.locator(".reveal-ready").evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === "1" && getComputedStyle(el).transform === "none")), "Reduced motion leaves content hidden");
checks.push("Reduced motion: no parallax and no hidden reveal content");
assert.equal(errors.length, 0, JSON.stringify(errors));
assert.equal(requests.length, 0, JSON.stringify(requests));
checks.push("No console errors, external requests or data transmission");
await fs.writeFile(
  "screenshots/futuristic/verification.json",
  JSON.stringify({ date: "2026-11-16", checks, errors, requests }, null, 2),
);
console.log(checks.join("\n"));
await browser.close();
