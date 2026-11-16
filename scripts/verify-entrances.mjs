import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_URL || "http://localhost:3002";
await fs.mkdir("screenshots/entrances", { recursive: true });
await page.goto(base, { waitUntil: "domcontentloaded" });
assert.equal(await page.locator(".hero-line-text").count(), 3);
assert(
  await page
    .locator(".hero-line-text")
    .evaluateAll((nodes) =>
      nodes.every((n) => getComputedStyle(n).animationName === "title-arrive"),
    ),
);
assert(
  await page
    .locator(".hero-sculpture img")
    .evaluate((n) => getComputedStyle(n).animationName === "sculpture-arrive"),
);
await page.screenshot({ path: "screenshots/entrances/hero-arriving.png" });
await page.waitForTimeout(1800);
assert(
  await page
    .locator(".hero-line-text")
    .evaluateAll((nodes) =>
      nodes.every((n) => getComputedStyle(n).opacity === "1"),
    ),
);
await page.screenshot({ path: "screenshots/entrances/hero-visible.png" });
const card = page.locator(".release-card").first();
assert(
  await card.evaluate(
    (e) =>
      e.classList.contains("reveal-ready") &&
      !e.classList.contains("is-revealed"),
  ),
);
await page
  .locator("#musique")
  .evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(180);
await page.screenshot({ path: "screenshots/entrances/releases-arriving.png" });
await page.waitForTimeout(1500);
assert(
  await card.evaluate(
    (e) =>
      e.classList.contains("is-revealed") &&
      getComputedStyle(e).opacity === "1",
  ),
);
assert.notEqual(
  await page
    .locator(".release-card")
    .nth(0)
    .evaluate((e) => e.style.getPropertyValue("--reveal-delay")),
  await page
    .locator(".release-card")
    .nth(1)
    .evaluate((e) => e.style.getPropertyValue("--reveal-delay")),
);
await page.screenshot({ path: "screenshots/entrances/releases-visible.png" });
await page
  .locator("#booking")
  .evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
await page.waitForTimeout(1300);
assert(
  await page
    .locator(".booking-visual")
    .evaluate((e) => e.classList.contains("is-revealed")),
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForTimeout(100);
assert.equal(await page.locator(".reveal-ready").count(), 0);
assert(
  await page
    .locator(".hero-line-text")
    .evaluateAll((nodes) =>
      nodes.every(
        (n) =>
          getComputedStyle(n).animationName === "none" &&
          getComputedStyle(n).opacity === "1",
      ),
    ),
);
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 550) {
    scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 80));
  }
});
await page.waitForTimeout(1600);
const hidden = await page
  .locator(".reveal-ready:not(.is-revealed)")
  .evaluateAll((nodes) =>
    nodes.map((e) => ({
      class: e.className,
      top: e.getBoundingClientRect().top,
      height: e.getBoundingClientRect().height,
    })),
  );
assert.equal(hidden.length, 0, JSON.stringify(hidden));
await page.screenshot({
  path: "screenshots/entrances/mobile-visible.png",
  fullPage: true,
});
assert.equal(errors.length, 0, JSON.stringify(errors));
const checks = [
  "Three staggered title lines on load",
  "Generated hero image entrance",
  "Scroll cards hidden before entry and visible afterward",
  "Independent stagger delays",
  "Booking sculpture reveal",
  "Live reduced-motion change exposes all content and disables entrances",
  "Mobile: all sections reveal and no horizontal overflow",
  "No JavaScript errors",
];
await fs.writeFile(
  "screenshots/entrances/verification.json",
  JSON.stringify({ checks, errors }, null, 2),
);
console.log(checks.join("\n"));
await browser.close();
