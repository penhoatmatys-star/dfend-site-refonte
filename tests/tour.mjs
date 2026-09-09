#!/usr/bin/env node
/* Parcourt une page section par section et capture chaque arret.
 *
 *   node tests/tour.mjs [--p services] [--w 1440] [--h 900]
 *
 * Une capture `fullPage` ne vaut rien sur ce site : Chromium redimensionne
 * la fenetre pour la prendre, ScrollTrigger ne se declenche jamais, et tout
 * ce qui porte `data-reveal` ressort a l'opacite zero. Il faut defiler pour
 * de vrai, attendre, puis prendre une capture de la taille du viewport.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf("--" + n);
  return i === -1 ? d : args[i + 1];
};
const route = flag("p", "") ? "/" + String(flag("p", "")).replace(/^\/+/, "") : "/";
const BASE = process.env.BASE ?? "http://127.0.0.1:3222";
const width = Number(flag("w", 1440));
const height = Number(flag("h", 900));
const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
const OUT = path.join(process.cwd(), "tests", "shots");
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(() => {
  try {
    sessionStorage.setItem("dfend:intro", "done");
  } catch {}
});

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160));
});

await page.goto(BASE + route, { waitUntil: "networkidle2" });
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
});

const total = await page.evaluate(() => document.body.scrollHeight);
const stops = [];
for (let y = 0; y < total - 40; y += Math.round(height * 0.85)) stops.push(y);

let i = 0;
for (const y of stops) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  // Le stagger des revelations dure 0.7 s plus 0.06 par element : on laisse
  // le temps a la section d'arriver au bout de son tween.
  await new Promise((r) => setTimeout(r, 1300));
  const file = path.join(OUT, `${slug}-${String(++i).padStart(2, "0")}.png`);
  await page.screenshot({ path: file });
  console.log("ecrit " + path.basename(file) + "  (y=" + y + ")");
}

/* Ce qui est encore transparent apres le passage est un vrai defaut : le
 * chien de garde aurait du le rattraper. */
const stuck = await page.evaluate(() =>
  [...document.querySelectorAll("[data-reveal]")]
    .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
    .map((el) => el.tagName + "." + String(el.className).slice(0, 40)),
);

console.log("\n" + stops.length + " arrets, " + slug);
console.log(stuck.length ? "RESTE TRANSPARENT : " + stuck.join(", ") : "aucun element bloque a l'opacite zero");
console.log(errors.length ? "erreurs :\n  " + errors.join("\n  ") : "console propre");
await browser.close();
