import { chromium } from "playwright";
import fs from "node:fs/promises";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage();
const data = [];
for (const slug of [
  "donne-ta-teuch",
  "tracto-azzuro",
  "summer-brainrot",
  "kdo",
]) {
  await p.goto("https://tractopellemusic.com/sorties/" + slug);
  data.push(
    await p.evaluate(() => ({
      url: location.href,
      text: document.querySelector("main").innerText,
      links: [...document.querySelectorAll("main a")].map((a) => ({
        text: a.innerText,
        url: a.href,
      })),
    })),
  );
}
await fs.writeFile("research/releases.json", JSON.stringify(data, null, 2));
await b.close();
