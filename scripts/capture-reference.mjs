import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const pages = ["/", "/artistes", "/demos", "/la-liste", "/labels/tractolabel"];
const report = [];
for (const path of pages) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto("https://tractopellemusic.com" + path, {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const name = path === "/" ? "home" : path.split("/").pop();
  await page.screenshot({
    path: `screenshots/original/${name}-desktop-full.png`,
    fullPage: true,
  });
  const data = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    links: [...document.querySelectorAll("main a")].map((a) => ({
      text: a.innerText,
      href: a.href,
    })),
    images: [...document.images].map((i) => ({
      alt: i.alt,
      src: i.currentSrc,
    })),
    styles: [...document.querySelectorAll("header,h1,h2,main,section,button")]
      .slice(0, 35)
      .map((e) => {
        const s = getComputedStyle(e);
        return {
          tag: e.tagName,
          class: e.className,
          text: e.textContent.slice(0, 90),
          font: s.fontFamily,
          size: s.fontSize,
          weight: s.fontWeight,
          line: s.lineHeight,
          color: s.color,
          background: s.background,
          padding: s.padding,
          maxWidth: s.maxWidth,
          borderRadius: s.borderRadius,
        };
      }),
  }));
  report.push({ path, ...data });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `screenshots/original/${name}-mobile-full.png`,
    fullPage: true,
  });
  await page.close();
}
await fs.writeFile("research/reference.json", JSON.stringify(report, null, 2));
await browser.close();
