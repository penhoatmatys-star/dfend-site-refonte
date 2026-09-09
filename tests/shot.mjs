#!/usr/bin/env node
/* Capture d'ecran sous Chromium reel.
 *
 *   node tests/shot.mjs [--p about] [--w 1440] [--h 900] [--y 2400]
 *                       [--full] [--label nom] [--wait 1200] [--intro]
 *
 * La route se donne sans barre oblique (`--p about`) : sous Git Bash, un
 * argument qui commence par « / » est traduit en chemin Windows avant meme
 * d'atteindre node, et l'URL arrive invalide.
 *
 * Le panneau d'apercu de l'editeur bride les frames : un canvas WebGL n'y
 * peint pas de facon fiable et une capture peut revenir vide. C'est Chromium
 * qui tranche, jamais l'apercu.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf("--" + name);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes("--" + name);

const page_ = flag("p", "");
const route = page_ ? "/" + page_.replace(/^\/+/, "") : "/";
const BASE = process.env.BASE ?? "http://127.0.0.1:3111";
const width = Number(flag("w", 1440));
const height = Number(flag("h", 900));
const scrollY = Number(flag("y", 0));
const wait = Number(flag("wait", 1400));
const label = flag("label", "");
const OUT = path.join(process.cwd(), "tests", "shots");
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: "shell",
  args: [
    // Sans cela, Chromium headless rend le WebGL en logiciel ou pas du tout.
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });

// Par defaut on saute l'intro : elle joue une fois par session et fausserait
// toute capture de page. `--intro` la laisse jouer.
if (!has("intro")) {
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dfend:intro", "done");
    } catch {}
  });
}

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160));
});

await page.goto(BASE + route, { waitUntil: "networkidle2" });
if (scrollY) {
  await page.evaluate((y) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, y);
  }, scrollY);
}
await new Promise((r) => setTimeout(r, wait));

const slug =
  (route === "/" ? "home" : route.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "")) +
  (scrollY ? "-y" + scrollY : "") +
  (label ? "-" + label : "");
const file = path.join(OUT, slug + ".png");
await page.screenshot({ path: file, fullPage: has("full") });
console.log("ecrit " + file);
if (errors.length) {
  console.log("\nerreurs console (" + errors.length + ") :");
  for (const e of errors) console.log("  " + e);
} else {
  console.log("console propre");
}
await browser.close();
