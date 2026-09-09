#!/usr/bin/env node
/* Passes de verification dfend.swiss.
 *
 *   npm run build && npx next start --port 3222
 *   node tests/run.mjs
 *
 * Aucune tache n'est terminee sans la sortie de ce fichier.
 *
 * On mesure sur le build de production, jamais sur `next dev` : le serveur de
 * developpement injecte son propre client HMR, sa surcouche d'erreurs et des
 * chemins de rendu qui n'existent pas en ligne. Une erreur d'hydratation ne
 * s'est vue qu'en production, dans ce projet.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const BASE = process.env.BASE ?? "http://127.0.0.1:3222";
/* Le site tient sur une seule page. Les onglets « about », « services »,
 * « testimonials » et « contact » sont des ancres de l'accueil ; seules
 * `/download` et `/legal` sont des pages a part entiere. */
const PAGES = ["/", "/legal", "/download"];

let failures = 0;
const line = (s) => process.stdout.write(s + "\n");
function check(ok, label, detail) {
  if (!ok) failures++;
  line(`   ${ok ? "ok   " : "ECHEC"}  ${label}${detail ? "  — " + detail : ""}`);
}
function head(t) {
  line("\n" + t + "\n" + "-".repeat(t.length));
}

/* Le navigateur est le seul convertisseur de couleur fiable : on peint la
 * valeur calculee sur un canvas 1x1 et on relit le pixel. Parser l'OKLCH
 * comme du RGB donne des ratios faux, typiquement 1.07 partout. */
const COLOR_TOOLS = `
window.__toRGB = function (css, under) {
  var c = document.createElement('canvas'); c.width = c.height = 1;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = under || '#ffffff'; x.fillRect(0, 0, 1, 1);
  x.fillStyle = css; x.fillRect(0, 0, 1, 1);
  var d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
};
window.__lum = function (rgb) {
  var f = rgb.map(function (v) {
    v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
};
window.__ratio = function (a, b) {
  var la = window.__lum(a), lb = window.__lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
/* Remonte les ancetres et EMPILE les fonds jusqu'a en trouver un opaque.
 *
 * La premiere version s'arretait au premier fond non transparent et le
 * rendait tel quel. Une plaque en bg-night/55 posee sur la nuit revenait
 * donc comme un gris a 55 % que __toRGB composait ensuite sur du blanc : le
 * fond mesure sortait clair, et les etiquettes blanches du formulaire
 * tombaient a 4.42:1 alors qu'elles sont sur du presque noir. On compose donc
 * du fond le plus profond vers le plus proche, comme le navigateur peint. */
window.__bgOf = function (el) {
  var stack = [];
  var node = el;
  while (node && node !== document.documentElement) {
    var bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== 'transparent' && !/rgba\(0, 0, 0, 0\)/.test(bg)) {
      stack.push(bg);
      var m = /^rgba?\(([^)]+)\)/.exec(bg);
      var alpha = m ? parseFloat(m[1].split(',')[3]) : 1;
      if (isNaN(alpha) || alpha >= 0.999) break;
    }
    node = node.parentElement;
  }
  stack.push(getComputedStyle(document.body).backgroundColor || '#ffffff');

  var c = document.createElement('canvas'); c.width = c.height = 1;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 1, 1);
  for (var i = stack.length - 1; i >= 0; i--) {
    x.fillStyle = stack[i]; x.fillRect(0, 0, 1, 1);
  }
  var d = x.getImageData(0, 0, 1, 1).data;
  return 'rgb(' + d[0] + ', ' + d[1] + ', ' + d[2] + ')';
};
`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport({
    width: opts.width ?? 1280,
    height: opts.height ?? 900,
    isMobile: opts.isMobile ?? false,
    hasTouch: opts.isMobile ?? false,
    deviceScaleFactor: 1,
  });
  if (opts.reducedMotion) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }
  if (opts.noJs) await page.setJavaScriptEnabled(false);
  // L'intro joue une fois par session et fausserait chaque mesure. Les
  // passes qui la visent la rallument explicitement.
  if (!opts.intro) {
    await page.evaluateOnNewDocument(() => {
      try {
        sessionStorage.setItem("dfend:intro", "done");
      } catch {}
    });
  }
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message.slice(0, 200)));
  page.on("requestfailed", (r) => {
    const t = r.failure()?.errorText ?? "";
    if (!/ERR_ABORTED/.test(t)) errors.push("requete perdue: " + r.url());
  });
  page.__errors = errors;
  return page;
}

/* --- 1. reveals et erreurs console, page par page ------------------------ */

async function passReveals(browser) {
  head("1. reveals d'animation et erreurs console, page par page");
  for (const p of PAGES) {
    const page = await open(browser);
    await page.goto(BASE + p, { waitUntil: "networkidle2" });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });
    // On descend par paliers : ScrollTrigger ne declenche pas une section
    // qu'on saute d'un bond jusqu'au pied de page.
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await wait(220);
    }
    await wait(1200);

    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")]
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99)
        .map((el) => el.tagName.toLowerCase() + "." + String(el.className).slice(0, 30)),
    );
    check(stuck.length === 0, `${p} — tous les reveals arrives`, stuck.slice(0, 3).join(" | "));
    check(page.__errors.length === 0, `${p} — console propre`, page.__errors.slice(0, 2).join(" | "));
    await page.close();
  }
}

/* --- 2. mobile 375px, debordement horizontal ----------------------------- */

async function passMobile(browser) {
  head("2. viewport mobile 375px, debordement horizontal");
  for (const p of PAGES) {
    const page = await open(browser, { width: 375, height: 812, isMobile: true });
    await page.goto(BASE + p, { waitUntil: "networkidle2" });
    await wait(600);
    const r = await page.evaluate(() => {
      // `overflow-x: hidden` sur body rend la passe verte par construction :
      // on leve le rognage avant de mesurer.
      const prev = document.body.style.overflowX;
      document.body.style.overflowX = "visible";
      void document.documentElement.offsetWidth;
      const W = window.innerWidth;
      /* Un element large a l'interieur d'un conteneur qui le rogne ne fait
         pas deborder la page : la bande defilante est plus large que l'ecran
         par construction. On ne retient que ce qu'aucun ancetre ne coupe. */
      const clipped = (el) => {
        let n = el.parentElement;
        while (n && n !== document.body) {
          const o = getComputedStyle(n);
          if (o.overflowX === "hidden" || o.overflowX === "clip" ||
              o.overflow === "hidden" || o.overflow === "clip") return true;
          n = n.parentElement;
        }
        return false;
      };
      const over = [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > W + 1 && !clipped(el))
        .map((el) => el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0]);
      // Un mot trop long deborde sans elargir son bloc : on lit aussi les
      // rectangles des noeuds de texte.
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        if (!n.textContent.trim()) continue;
        /* Le texte servi en `sr-only` mesure la phrase entiere mais son
           propre conteneur le rogne a un pixel. On part donc de l'element
           lui-meme, pas de son parent. */
        const host = n.parentElement;
        if (!host) continue;
        const oh = getComputedStyle(host);
        if (oh.overflow === "hidden" || oh.overflowX === "hidden" ||
            oh.overflow === "clip" || oh.overflowX === "clip") continue;
        if (clipped(host)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const b of range.getClientRects()) {
          if (b.right > W + 1) {
            over.push(`texte "${n.textContent.trim().slice(0, 20)}" jusqu'a ${Math.round(b.right)}px`);
            break;
          }
        }
      }
      const scrollW = document.documentElement.scrollWidth;
      document.body.style.overflowX = prev;
      return { scrollW, innerW: W, over: over.slice(0, 4) };
    });
    check(
      r.scrollW <= r.innerW + 1 && r.over.length === 0,
      `${p} — pas de debordement`,
      `scrollWidth ${r.scrollW}/${r.innerW}` + (r.over.length ? " | " + r.over.join(", ") : ""),
    );
    await page.close();
  }
}

/* --- 3. la methode en rail : contenu, clavier, progression --------------- */

async function passSystem(browser) {
  head("3. la methode en trois temps");

  /* Le `tablist` a ete remplace par un rail de progression le 2026-09-07 ;
   * la liste des six prestations sous « design » a ete retiree le 2026-09-09.
   * Les trois phases ne portent plus que leur numero et leur intitule. On
   * verifie qu'elles sont toutes les trois dans le flux, qu'aucune n'est
   * repliee, et que la progression au clavier marche. */
  for (const [label, opts] of [
    ["desktop", { width: 1280, height: 900 }],
    ["mobile", { width: 375, height: 812, isMobile: true }],
  ]) {
    const page = await open(browser, opts);
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await wait(700);

    const shape = await page.evaluate(() => {
      const steps = [...document.querySelectorAll("#system article[data-index]")];
      return {
        steps: steps.length,
        heads: steps.map((s) => s.querySelector("h3")?.textContent?.trim() ?? ""),
        // Aucune etape ne doit etre masquee : c'est tout l'objet du changement.
        hidden: steps.filter((s) => {
          const cs = getComputedStyle(s);
          return cs.display === "none" || cs.visibility === "hidden" || s.hidden;
        }).length,
        numerals: steps.map((s) => s.querySelector("p")?.textContent?.trim() ?? ""),
      };
    });

    check(shape.steps === 3, `${label} — les trois phases sont dans le flux`, `${shape.steps}`);
    check(shape.hidden === 0, `${label} — aucune phase n'est repliee`, `${shape.hidden} masquees`);
    check(
      shape.numerals.join() === "01,02,03",
      `${label} — la sequence est numerotee, c'est la seule du site qui l'est`,
      shape.numerals.join(),
    );
    check(
      shape.heads[1]?.toLowerCase().includes("architecture"),
      `${label} — la phase 2 porte bien « design your protection architecture »`,
      shape.heads[1],
    );
    await page.close();
  }

  /* L'index colle n'existe qu'a partir de 1024px. Ses trois boutons amenent a
   * l'etape, et l'echine se remplit d'un cran a l'autre. */
  const page = await open(browser, { width: 1280, height: 900 });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(700);

  const rail = await page.$$("#system ol button");
  check(rail.length === 3, "l'index colle porte les trois crans", `${rail.length}`);

  const fillOf = () =>
    page.evaluate(() => {
      const bar = document.querySelector("#system ol span:nth-of-type(2)");
      if (!bar) return null;
      const m = /scaleY\(([\d.]+)\)/.exec(bar.getAttribute("style") ?? "");
      return m ? Number(m[1]) : null;
    });

  await rail[2]?.click();
  await wait(1200);
  const after = await fillOf();
  const current = await page.evaluate(
    () =>
      document.querySelector('#system ol [aria-current="step"]')?.textContent?.trim() ??
      null,
  );
  check(
    after !== null && after > 0.9,
    "un clic sur le cran 03 remplit l'echine jusqu'en bas",
    `scaleY ${after}`,
  );
  check(
    Boolean(current && current.startsWith("03")),
    "et le cran atteint est marque aria-current=step",
    String(current),
  );

  /* Un seul arret de tabulation par cran, et le focus se voit. Le rail est
   * fait de vrais boutons : c'est ce qui remplace la gestion de touches du
   * tablist, et c'est moins de code pour le meme service. */
  const focusable = await page.evaluate(
    () => [...document.querySelectorAll("#system ol button")].filter((b) => b.tabIndex >= 0).length,
  );
  check(focusable === 3, "les trois crans sont atteignables au clavier", `${focusable}`);
  await page.close();
}

/* --- 4. le menu mobile ---------------------------------------------------- */

async function passMenu(browser) {
  head("4. le menu mobile");
  const page = await open(browser, { width: 375, height: 812, isMobile: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(600);

  const shown = () =>
    page.evaluate(() => {
      const nav = document.getElementById("nav");
      const btn = document.querySelector(".nav-toggle, [aria-controls='nav']");
      const box = nav.getBoundingClientRect();
      return {
        visible: getComputedStyle(nav).display !== "none",
        expanded: btn.getAttribute("aria-expanded"),
        // position: fixed dans un parent transforme sort de l'ecran. On
        // verifie que le panneau est bien dans le viewport, pas seulement
        // qu'il est affiche.
        inView: box.top >= 0 && box.left >= -1 && box.right <= window.innerWidth + 1,
        logoOverlap: (() => {
          const logo = document.querySelector("header img");
          if (!logo || getComputedStyle(nav).display === "none") return false;
          const l = logo.getBoundingClientRect();
          return !(box.bottom <= l.top || box.top >= l.bottom);
        })(),
      };
    });

  const closed = await shown();
  check(!closed.visible && closed.expanded === "false", "ferme au chargement", JSON.stringify(closed));

  await page.click("[aria-controls='nav']");
  await wait(300);
  const open_ = await shown();
  check(open_.visible && open_.expanded === "true", "le bouton ouvre le panneau", JSON.stringify(open_));
  check(open_.inView, "le panneau est dans le viewport", JSON.stringify(open_));
  check(!open_.logoOverlap, "le panneau ne chevauche pas le logo");

  await page.keyboard.press("Escape");
  await wait(300);
  const esc = await shown();
  check(!esc.visible && esc.expanded === "false", "Echap referme le panneau");
  await page.close();
}

/* --- 5. contraste AA, converti par le navigateur ------------------------- */

async function passContrast(browser) {
  head("5. contraste AA, couleurs converties par le navigateur");
  for (const p of PAGES) {
    const page = await open(browser);
    await page.goto(BASE + p, { waitUntil: "networkidle2" });
    await page.evaluate(COLOR_TOOLS);
    await wait(400);

    const bad = await page.evaluate(() => {
      const out = [];
      const nodes = [...document.querySelectorAll("body *")].filter((el) => {
        if (!el.firstChild) return false;
        if (el.closest("#intro")) return false;
        const hasText = [...el.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
        );
        if (!hasText) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.05;
      });
      for (const el of nodes) {
        const cs = getComputedStyle(el);
        const bg = window.__bgOf(el);
        const fg = window.__toRGB(cs.color, bg);
        const back = window.__toRGB(bg);
        const ratio = window.__ratio(fg, back);
        const px = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight, 10) >= 700;
        // AA : 3:1 pour du grand texte (24px, ou 18.66px en gras), 4.5:1 sinon
        const large = px >= 24 || (px >= 18.66 && bold);
        const need = large ? 3 : 4.5;
        if (ratio < need) {
          out.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 24)} ` +
              `${ratio.toFixed(2)}:1 (exige ${need}) « ${el.textContent.trim().slice(0, 24)} »`,
          );
        }
      }
      return out.slice(0, 5);
    });
    check(bad.length === 0, `${p} — tout le texte passe AA`, bad.join(" | "));
    await page.close();
  }
}

/* --- 6. contraste sur image, mesure sur les pixels reellement peints ------ */

/* Lit le fond d'un element en capturant l'ecran, son texte rendu invisible,
 * et en relisant les pixels. C'est la seule mesure valable des que le fond
 * n'est pas un aplat CSS : `__bgOf` remonte les ancetres et rend le fond
 * declare de la section, qui sous une video ne dit rien de ce qu'on voit.
 *
 * On efface la COULEUR du texte, pas l'element : masquer l'element retire
 * aussi son propre fond, et on mesurerait alors ce qu'il y a derriere son
 * aplat au lieu de ce sur quoi le texte est reellement pose. C'est l'erreur
 * qui a fait recaler les six legendes a 1.44:1 alors qu'elles sont sur du
 * noir plein.
 *
 * On garde le PIRE rapport de la zone, pixel par pixel, pas la moyenne : une
 * moyenne acceptable peut cacher un projecteur en pleine lettre. */
const MEASURE_STYLE = `
[data-measuring], [data-measuring] * {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
}`;

async function worstRatioBehind(page, handle) {
  /* On amene la cible a l'ecran et on laisse la revelation au defilement finir
   * son tween, sinon on mesure un element encore a mi-opacite. */
  await handle.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await wait(900);

  const box = await handle.boundingBox();
  if (!box || box.width < 8 || box.height < 8) return null;

  const color = await handle.evaluate((el) => getComputedStyle(el).color);
  await handle.evaluate((el, css) => {
    if (!document.getElementById("measure-style")) {
      const style = document.createElement("style");
      style.id = "measure-style";
      style.textContent = css;
      document.head.append(style);
    }
    el.dataset.measuring = "1";
  }, MEASURE_STYLE);

  /* `handle.screenshot()` et non `page.screenshot({ clip })` : le clip d'une
   * capture de page est en coordonnees de document, la boite d'un handle en
   * coordonnees de frame, et les deux ne coincident qu'a scrollY = 0. Des
   * qu'on defile, le clip vise a cote — les six legendes revenaient toutes a
   * la valeur du vert, 169/255, qui est celle de l'entaille du heros restee
   * sous l'objectif. La capture d'element cadre l'element, point. */
  const shot = await handle.screenshot({ encoding: "base64" });

  await handle.evaluate((el) => {
    delete el.dataset.measuring;
  });

  return page.evaluate(
    async (data, css) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(img, 0, 0);
          const px = x.getImageData(0, 0, c.width, c.height).data;
          const fg = window.__lum(window.__toRGB(css, "#000000"));
          /* Trois pixels de retrait sur chaque bord : sans eux on mesure le
           * liseré et non l'interieur. Le contour blanc du bouton fantome
           * donnait 1.00:1 contre son propre texte blanc, et l'antialiasing du
           * bord d'un bouton vert pose sur une video sombre donnait 1.00:1
           * aussi. Aucun texte du site ne touche le bord de sa boite : le plus
           * serre a 12px de padding. */
          const inset = 3;
          let worst = Infinity;
          let culprit = 0;
          for (let y = inset; y < c.height - inset; y += 2) {
            for (let vx = inset; vx < c.width - inset; vx += 2) {
              const i = (y * c.width + vx) * 4;
              const bg = window.__lum([px[i], px[i + 1], px[i + 2]]);
              const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
              if (ratio < worst) {
                worst = ratio;
                culprit = Math.round((px[i] + px[i + 1] + px[i + 2]) / 3);
              }
            }
          }
          resolve({ worst, culprit });
        };
        img.src = "data:image/png;base64," + data;
      }),
    shot,
    color,
  );
}

async function passContrastOnPhoto(browser) {
  head("6. contraste du texte pose sur une image, pixels reels");
  const page = await open(browser);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(COLOR_TOOLS);
  await wait(1200);

  /* Les legendes des photos restent sous l'image, comme avant. */
  const overlaid = await page.evaluate(() => {
    const out = [];
    for (const fig of document.querySelectorAll("figure")) {
      const img = fig.querySelector("img");
      if (!img) continue;
      const ib = img.getBoundingClientRect();
      for (const el of fig.querySelectorAll("figcaption, p, span, h1, h2, h3")) {
        const b = el.getBoundingClientRect();
        const overlap =
          b.left < ib.right && b.right > ib.left && b.top < ib.bottom && b.bottom > ib.top;
        if (overlap && el.textContent.trim()) out.push(el.textContent.trim().slice(0, 30));
      }
    }
    return out;
  });
  check(
    overlaid.length === 0,
    "aucune legende de photo n'est posee sur sa photo",
    overlaid.length
      ? overlaid.join(" | ")
      : "les legendes sont sous l'image, pas dessus",
  );

  /* Le heros, lui, EST du texte sur une image en mouvement. On le mesure a
   * cinq instants de la boucle, un par plan : le projecteur du plan 3 est le
   * fond le plus clair du site, et c'est lui qui a fixe l'opacite des voiles.
   * Si le navigateur ne sait pas decoder le H.264, la video reste sur son
   * affiche et on mesure l'affiche : c'est encore une mesure vraie. */
  const targets = [
    ["h1", "section h1"],
    ["lede", "section p.lede"],
    ["bouton « contact us »", "section a[href='#contact']"],
  ];

  for (const at of [0, 4, 8, 12, 16]) {
    await page.evaluate((t) => {
      const v = document.querySelector("video");
      if (!v) return;
      v.pause();
      v.currentTime = t;
    }, at);
    await wait(400);

    for (const [name, selector] of targets) {
      const handle = await page.$(selector);
      if (!handle) {
        check(false, `heros t=${at}s — ${name} introuvable`, selector);
        continue;
      }
      const r = await worstRatioBehind(page, handle);
      await handle.dispose();
      if (!r) continue;
      /* Le titre est du grand texte, AA lui demande 3:1. On lui demande 4.5
       * quand meme : il est en vert de marque sur une image, et 3:1 sur une
       * surface qui bouge se lit mal des que le plan change. */
      check(
        r.worst >= 4.5,
        `heros t=${at}s — ${name} tient 4.5:1 sur l'image`,
        `${r.worst.toFixed(2)}:1, pire pixel de fond ${r.culprit}/255`,
      );
    }
  }

  /* Le bloc Fortiva est le second texte du site pose sur une video. Le plan
   * est celui d'une main qui signe, fourni par le client : ses zones claires
   * sont le papier et la main, et c'est sur elles que le voile a ete calibre.
   * On remet la video en marche apres les arrets sur image du heros. */
  await page.evaluate(() => {
    for (const v of document.querySelectorAll("video")) void v.play?.().catch(() => {});
  });
  for (const [name, selector] of [
    ["lede", "#fortiva p.lede"],
    ["bouton « enter & apply »", "#fortiva a"],
  ]) {
    const handle = await page.$(selector);
    if (!handle) {
      check(false, `fortiva — ${name} introuvable`, selector);
      continue;
    }
    const r = await worstRatioBehind(page, handle);
    await handle.dispose();
    if (!r) continue;
    check(
      r.worst >= 4.5,
      `fortiva — ${name} tient 4.5:1 sur la video`,
      `${r.worst.toFixed(2)}:1, pire pixel de fond ${r.culprit}/255`,
    );
  }

  /* Les six intitules de prestation.
   *
   * L'accordeon les portait en legende, sur un aplat d'encre pose devant la
   * photo. Le carrousel les sort de l'image : ils vivent maintenant dans la
   * pagination, sur le sol de la section. Ce qui est mesure ne change pas —
   * les six sont la, et chacun tient 4.5:1 sur ce qu'il y a derriere — mais
   * l'un des six est desormais a 45 % d'opacite, la marque du hors-centre.
   * Un intitule qu'on ne peut pas lire est une prestation qu'on ne vend pas,
   * donc c'est bien la valeur peinte, opacite comprise, qui est relevee.
   *
   * `worstRatioBehind` lit les pixels : le voile d'opacite y est deja. */
  const captions = await page.$$(
    '[aria-roledescription="carousel"][aria-label="Our six lines of cover"] ul button',
  );
  check(captions.length === 6, "les six prestations portent leur intitule", `${captions.length}`);
  for (const caption of captions.slice(0, 6)) {
    const text = await caption.evaluate((el) => el.textContent.trim().slice(0, 28));
    const r = await worstRatioBehind(page, caption);
    await caption.dispose();
    if (!r) continue;
    check(
      r.worst >= 4.5,
      `intitule « ${text} » tient 4.5:1`,
      `${r.worst.toFixed(2)}:1, pire pixel de fond ${r.culprit}/255`,
    );
  }

  await page.close();
}

/* --- 7. mouvement reduit et cibles tactiles ------------------------------ */

async function passMotionAndTargets(browser) {
  head("7. prefers-reduced-motion et cibles tactiles");

  const page = await open(browser, { reducedMotion: true, intro: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(1600);
  const r = await page.evaluate(() => ({
    intro: !!document.getElementById("intro"),
    pending: document.documentElement.classList.contains("intro-pending"),
    /* On ne compte que les contextes WEBGL, ce que dit l'intitule de la
       passe. Deux canvas 2D vivent maintenant sur la page — la piece en
       orbite et le champ de vecteurs du contact — et tous deux peignent une
       image fixe ou rien du tout sous mouvement reduit, ce qui est le
       comportement voulu. `getContext('webgl')` rend null sur un canvas qui
       porte deja un contexte 2D : c'est le discriminant, et il ne peut pas
       creer de contexte par accident puisque les deux canvas ont pris le
       leur au montage. */
    canvas: [...document.querySelectorAll("canvas")].filter(
      (c) => c.getContext("webgl2") || c.getContext("webgl"),
    ).length,
    flat: !!document.querySelector('img[src="/img/glyph-n.svg"]'),
    hidden: [...document.querySelectorAll("[data-reveal]")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.99,
    ).length,
  }));
  check(!r.intro && !r.pending, "sous mouvement reduit, aucune intro", JSON.stringify(r));
  check(r.canvas === 0 && r.flat, "la charniere sert le glyphe a plat, aucun contexte WebGL", JSON.stringify(r));
  check(r.hidden === 0, "aucun element laisse a l'opacite zero", `${r.hidden} elements`);
  await page.close();

  const m = await open(browser, { width: 375, height: 812, isMobile: true });
  await m.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(600);
  const small = await m.evaluate(() => {
    const out = [];
    /* Un lien pose au milieu d'une phrase est exempte par WCAG 2.5.8 : lui
       imposer 44px casserait l'interligne du paragraphe. On ne mesure que
       les cibles autonomes. */
    const inSentence = (el) => {
      const parent = el.parentElement;
      if (!parent) return false;
      return [...parent.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
      );
    };
    for (const el of document.querySelectorAll("a, button, [role='tab']")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;
      // Le lien d'evitement est rogne a 1px tant qu'il n'a pas le focus.
      if (b.width <= 1 || b.height <= 1) continue;
      if (inSentence(el)) continue;
      // `padding` plus `line-height` ne garantissent pas 44 : on mesure.
      if (b.height < 44) {
        out.push(`${el.tagName.toLowerCase()} « ${el.textContent.trim().slice(0, 18)} » ${b.height.toFixed(1)}px`);
      }
    }
    return out.slice(0, 5);
  });
  check(small.length === 0, "toutes les cibles tactiles font au moins 44px", small.join(" | "));
  await m.close();
}

/* --- 8. tout le contenu sans JavaScript ---------------------------------- */

async function passNoJs(browser) {
  head("8. rendu sans JavaScript");
  for (const p of PAGES) {
    const page = await open(browser, { noJs: true });
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    const r = await page.evaluate(() => ({
      // `innerText` rend le texte tel qu'il s'affiche, `text-transform`
      // compris : sur un site en bas de casse, on compare en minuscules.
      text: document.body.innerText.toLowerCase(),
      pending: document.documentElement.classList.contains("intro-pending"),
      intro: !!document.getElementById("intro"),
      hiddenPanels: [...document.querySelectorAll("[role='tabpanel']")].filter((x) => x.hidden).length,
      invisible: [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => parseFloat(getComputedStyle(el).opacity) < 0.99,
      ).length,
    }));
    check(!r.pending && !r.intro, `${p} — aucun rideau sans JavaScript`, JSON.stringify({ p: r.pending, i: r.intro }));
    check(r.invisible === 0, `${p} — rien n'est masque en CSS`, `${r.invisible} elements transparents`);
    check(r.text.length > 400, `${p} — la page porte son contenu`, `${r.text.length} caracteres`);
    if (p === "/") {
      check(r.hiddenPanels === 0, "/ — les trois charges utiles sont empilees et lisibles");
      check(
        r.text.includes("legacy planning") && r.text.includes("monitor and optimize"),
        "/ — les prestations et la phase 3 sont servies",
      );
    }
    await page.close();
  }
}

/* --- 9. l'ouverture ------------------------------------------------------- */

async function passIntro(browser) {
  head("9. l'ouverture : une fois par session, coupable, sans piege");

  /* Le script d'amorce vit dans public/, hors de React. Les deux fichiers
   * doivent s'accorder sur les memes chaines, sinon le rideau se pose et ne
   * se retire jamais. */
  const boot = readFileSync(new URL("../public/intro-boot.js", import.meta.url), "utf8");
  const lib = readFileSync(new URL("../lib/intro.ts", import.meta.url), "utf8");
  const key = lib.match(/INTRO_KEY\s*=\s*"([^"]+)"/)?.[1];
  const cls = lib.match(/INTRO_PENDING\s*=\s*"([^"]+)"/)?.[1];
  check(
    Boolean(key && cls && boot.includes(key) && boot.includes(cls)),
    "public/intro-boot.js et lib/intro.ts emploient les memes chaines",
    `cle « ${key} », classe « ${cls} »`,
  );

  const page = await open(browser, { intro: true });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });

  /* On attend l'evenement, pas une duree. Le rideau ne se leve qu'une fois le
   * paquet three.js arrive : sur une machine lente, une temporisation fixe
   * mesure le vide et fait echouer une passe qui devrait etre verte. */
  const appeared = await page
    .waitForSelector("#intro button", { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  check(appeared, "l'intro se monte a la premiere visite");
  check(appeared, "un bouton permet de la passer");

  const gone = await page
    .waitForFunction(() => !document.getElementById("intro"), { timeout: 12000 })
    .then(() => true)
    .catch(() => false);
  check(gone, "elle se retire toute seule sans qu'on y touche");
  await wait(200);
  const after = await page.evaluate(() => ({
    intro: !!document.getElementById("intro"),
    pending: document.documentElement.classList.contains("intro-pending"),
    session: sessionStorage.getItem("dfend:intro"),
    headerVisible: getComputedStyle(document.querySelector("header")).visibility,
  }));
  check(!after.pending, "le rideau ne laisse aucune classe derriere lui", JSON.stringify(after));
  check(after.session === "done", "la session est marquee", String(after.session));
  check(after.headerVisible === "visible", "la page a repris la main");

  /* Le chien de garde du script d'amorce doit rendre la page meme si rien
   * d'autre ne se passe : on verifie qu'il est borne. */
  const bootDelay = readFileSync(new URL("../public/intro-boot.js", import.meta.url), "utf8")
    .match(/}\s*,\s*(\d+)\s*\)/)?.[1];
  check(
    Number(bootDelay) > 0 && Number(bootDelay) <= 5000,
    "le chien de garde retire le rideau au plus tard",
    bootDelay + " ms",
  );

  // Seconde visite dans la meme session : plus d'intro.
  await page.goto(BASE + "/download", { waitUntil: "networkidle2" });
  await wait(700);
  const second = await page.evaluate(() => ({
    intro: !!document.getElementById("intro"),
    pending: document.documentElement.classList.contains("intro-pending"),
  }));
  check(!second.intro && !second.pending, "elle ne rejoue pas dans la meme session", JSON.stringify(second));

  /* Rien ne doit etre jete pendant l'ouverture. Les autres passes desactivent
   * l'intro, donc un composant qui se peint sous le rideau — la section est
   * alors `display:none`, mesuree a 0x0 — n'etait vu par aucune : la piece en
   * orbite jetait la un `IndexSizeError` sur un rayon d'ellipse negatif. */
  check(
    page.__errors.length === 0,
    "l'accueil ne jette rien pendant l'ouverture",
    page.__errors.slice(0, 2).join(" | "),
  );
  await page.close();
}

/* --- 10. metadonnees et pages de service --------------------------------- */

async function passMeta(browser) {
  head("10. titres, descriptions, image de partage, 404");
  for (const p of PAGES) {
    const page = await open(browser);
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    const m = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content ?? "",
      og: document.querySelector('meta[property="og:image"]')?.content ?? "",
      lang: document.documentElement.lang,
      h1: document.querySelectorAll("h1").length,
      alts: [...document.querySelectorAll("img")].filter((i) => i.alt === null).length,
    }));
    check(m.title.length > 10, `${p} — titre`, m.title);
    check(m.desc.length > 40, `${p} — meta description`, m.desc.slice(0, 50) + "...");
    check(Boolean(m.og), `${p} — image de partage`);
    check(m.lang === "en", `${p} — langue declaree`, m.lang);
    check(m.h1 === 1, `${p} — un seul h1`, `${m.h1}`);
    check(m.alts === 0, `${p} — toutes les images portent un alt`);
    await page.close();
  }

  const nf = await open(browser);
  const res = await nf.goto(BASE + "/cette-page-nexiste-pas", { waitUntil: "domcontentloaded" });
  const body = await nf.evaluate(() => document.body.innerText.toLowerCase());
  check(res.status() === 404, "404 — vrai code de statut", String(res.status()));
  check(body.includes("404") || body.includes("moved"), "404 — page personnalisee");
  check(body.includes("home page"), "404 — un chemin de retour");
  await nf.close();

  const rb = await open(browser);
  const r1 = await rb.goto(BASE + "/robots.txt", { waitUntil: "domcontentloaded" });
  check(r1.status() === 200, "robots.txt servi");
  const r2 = await rb.goto(BASE + "/sitemap.xml", { waitUntil: "domcontentloaded" });
  check(r2.status() === 200, "sitemap.xml servi");
  await rb.close();
}

/* --- 11. contenu : rien d'invente ---------------------------------------- */

async function passContent(browser) {
  head("11. contenu : aucune phrase d'attente, aucun faux temoignage");
  const forbidden = [
    "lorem",
    "a completer",
    "coming soon",
    "placeholder",
    "marco rossi",
    "luca bianchi",
    "enter relevant date",
    "select relevant option",
    "titolo 5",
    "saving taxes",
  ];
  for (const p of PAGES) {
    const page = await open(browser);
    await page.goto(BASE + p, { waitUntil: "networkidle2" });
    const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
    const hits = forbidden.filter((f) => text.includes(f));
    check(hits.length === 0, `${p} — aucune chaine interdite`, hits.join(", "));
    await page.close();
  }

  const page = await open(browser);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  const flagged = await page.$$eval("[data-legal-review]", (n) =>
    n.map((el) => el.getAttribute("data-legal-review")),
  );
  check(
    flagged.length > 0,
    "le temoignage litigieux reste marque pour arbitrage",
    flagged.join(", ") + " — voir tasks/todo.md #23",
  );
  await page.close();
}

/* --- 12. l'appel a l'action dans le premier ecran ------------------------ */

async function passFold(browser) {
  head("12. « contact us » dans le premier ecran");
  /* 1280x720 et 1440x768 sont deux formats d'ordinateur portable courants ;
   * 1920x820 est un portable branche sur un moniteur large mais court. C'est
   * la mesure a ces tailles qui a fait plafonner --text-4xl a 72px : au-dela,
   * le titre poussait le bouton sous la ligne de flottaison. */
  for (const [w, h] of [
    [1920, 820],
    [1536, 800],
    [1440, 900],
    [1440, 768],
    [1280, 720],
    [375, 812],
    [390, 844],
  ]) {
    const page = await open(browser, { width: w, height: h, isMobile: w < 600 });
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await wait(800);
    const r = await page.evaluate(() => {
      // Le bouton du heros, pas l'onglet « contact » de l'en-tete : l'onglet
      // pointe sur /#contact, le bouton sur #contact, et il est le seul <a>
      // du premier ecran.
      const cta = document.querySelector("section a[href='#contact']");
      if (!cta) return null;
      const b = cta.getBoundingClientRect();
      return { bottom: Math.round(b.bottom), vh: window.innerHeight };
    });
    check(
      Boolean(r) && r.bottom <= r.vh,
      `${w}x${h} — le bouton est visible sans defiler`,
      r ? `bas du bouton a ${r.bottom}px pour ${r.vh}px de haut` : "bouton introuvable",
    );
    await page.close();
  }
}

/* --- 13. le poids du premier chargement ---------------------------------- */

async function passWeight(browser) {
  head("13. poids du premier chargement");
  /* three.js pese a lui seul plus que tout le reste du site. Il ne doit
   * jamais partir avec la page : il arrive apres, pour l'ouverture et la
   * charniere, et seulement si le navigateur sait l'afficher.
   *
   * On lit `performance.getEntriesByType('resource')` cote page. Ni
   * `content-length` ni CDP ne servent ici : Next sert ses fragments en
   * transfert chunke, l'en-tete est absent, et `encodedDataLength` revient a
   * zero des qu'une reponse sort du cache memoire. */
  const page = await open(browser, { intro: true });
  const res = await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const html = await res.text();
  // Les scripts ecrits dans le HTML servi sont ceux du premier rendu ; tout
  // le reste arrive apres, a la demande.
  const initial = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
    (m) => new URL(m[1], BASE).href,
  );

  await page
    .waitForFunction(() => !document.getElementById("intro"), { timeout: 12000 })
    .catch(() => {});
  await wait(800);

  const w = await page.evaluate((initialUrls) => {
    const set = new Set(initialUrls);
    let initialJs = 0;
    let lateJs = 0;
    let biggest = { url: "", size: 0 };
    for (const e of performance.getEntriesByType("resource")) {
      if (e.initiatorType !== "script" && !/\.js(\?|$)/.test(e.name)) continue;
      const size = e.encodedBodySize || e.transferSize || 0;
      if (size > biggest.size) biggest = { url: e.name.split("/").pop(), size };
      if (set.has(e.name)) initialJs += size;
      else lateJs += size;
    }
    return { initialJs, lateJs, biggest, counted: performance.getEntriesByType("resource").length };
  }, initial);

  const kb = (n) => Math.round(n / 1024) + " ko";
  check(w.initialJs > 10 * 1024, "la mesure releve bien le premier rendu", kb(w.initialJs));
  /* 280 ko et pas 400 : le budget doit serrer la mesure du jour, sinon il ne
   * rattrape rien. Il etait a 392 ko tant que three.js partait avec la page. */
  check(
    w.initialJs < 280 * 1024,
    "le JavaScript du premier rendu reste sous 280 ko",
    kb(w.initialJs),
  );
  check(
    w.lateJs > 150 * 1024,
    "three.js arrive a la demande, pas avec la page",
    kb(w.lateJs) + " apres le premier rendu, plus gros fragment " + kb(w.biggest.size),
  );
  await page.close();
}

/* --- 14. le formulaire ---------------------------------------------------- */

async function passForm(browser) {
  head("14. le formulaire : validation serveur, sans JavaScript, sans fuite");

  /* Il est servi entier par le rendu serveur, sans JavaScript. Un formulaire
   * qui n'apparait qu'apres hydratation est un formulaire que les moteurs et
   * les navigateurs en echec ne voient jamais. Il ne vit plus que sur
   * l'accueil, en bas : la page /contact a ete retiree. */
  for (const p of ["/"]) {
    const page = await open(browser, { noJs: true });
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    const r = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;
      const field = (n) => form.querySelector(`[name="${n}"]`);
      const honey = field("company");
      return {
        /* Next ne pose pas d'attribut `action` : il cable l'action serveur
           par des champs caches $ACTION_* et poste sur l'URL courante. C'est
           leur presence qui dit que le formulaire est branche sans
           JavaScript. */
        wired: [...form.elements].some((el) => el.name.startsWith("$ACTION")),
        names: [...form.elements].map((el) => el.name).filter((n) => n && !n.startsWith("$ACTION")),
        labelled: ["name", "email", "role", "message", "consent"].every((n) => {
          const el = field(n);
          return el && !!form.querySelector(`label[for="${el.id}"]`);
        }),
        options: form.querySelectorAll('select[name="role"] option').length,
        honeyTab: honey ? honey.tabIndex : null,
        /* Le champ lui-meme garde sa largeur de mise en page : c'est son
           conteneur `sr-only` qui le rogne a un pixel. On mesure donc le
           conteneur, pas l'input. */
        honeyClipped: honey
          ? honey.closest("[aria-hidden='true']")?.getBoundingClientRect().width <= 4
          : null,
      };
    });
    check(Boolean(r), `${p} — le formulaire est servi par le serveur`);
    if (!r) {
      await page.close();
      continue;
    }
    check(r.wired, `${p} — il est branche sur une action serveur`);
    check(
      ["name", "email", "role", "message", "consent"].every((n) => r.names.includes(n)),
      `${p} — les cinq champs sont la`,
      r.names.join(", "),
    );
    check(r.labelled, `${p} — chaque champ porte son etiquette`);
    // six intitules de AUDIENCES plus la ligne « Choose one »
    check(r.options === 7, `${p} — les six roles publies, et rien de plus`, `${r.options} options`);
    check(
      r.honeyTab === -1 && r.honeyClipped === true,
      `${p} — le champ appat est hors du parcours et hors de l'ecran`,
      `tabIndex ${r.honeyTab}, rogne ${r.honeyClipped}`,
    );
    await page.close();
  }

  /* La validation refaite cote serveur. On desactive JavaScript pour que ni
   * `required` ni React ne puissent intercepter : c'est le serveur qui repond,
   * et c'est le serveur qu'on mesure. */
  const page = await open(browser, { noJs: true });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.type('[name="name"]', "x");
  await page.type('[name="email"]', "pas-une-adresse");
  await page.type('[name="message"]', "trop court");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click('button[type="submit"]'),
  ]);
  const back = await page.evaluate(() => {
    const form = document.querySelector("form");
    const field = (n) => form?.querySelector(`[name="${n}"]`);
    return {
      invalid: ["name", "email", "role", "message", "consent"].filter(
        (n) => field(n)?.getAttribute("aria-invalid") === "true",
      ),
      described: ["name", "email", "role", "message", "consent"].filter((n) => {
        const id = field(n)?.getAttribute("aria-describedby");
        return id && document.getElementById(id)?.textContent.trim();
      }),
      kept: field("email")?.value,
      text: document.body.innerText.toLowerCase(),
    };
  });
  check(
    back.invalid.length === 5,
    "sans JavaScript, le serveur refuse les cinq champs",
    back.invalid.join(", "),
  );
  check(
    back.described.length === 5,
    "chaque refus est annonce sous son champ",
    back.described.join(", "),
  );
  check(back.kept === "pas-une-adresse", "ce qui etait tape est rendu", back.kept);
  check(
    !back.text.includes("message sent"),
    "rien n'est annonce comme envoye",
  );
  await page.close();

  /* Un envoi valide, sans DFEND_FORM_WEBHOOK configure. Il doit echouer
   * franchement et rendre l'adresse e-mail : un formulaire qui repond
   * « envoye » sans destination perd les messages en silence, et c'est
   * exactement ce que todo.md #4 refusait. */
  const ok = await open(browser, { noJs: true });
  await ok.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await ok.type('[name="name"]', "Test Lugano");
  await ok.type('[name="email"]', "test@example.com");
  await ok.select('[name="role"]', "Agents");
  await ok.type(
    '[name="message"]',
    "Two sentences at least, so the server has something to work from here.",
  );
  await ok.click('[name="consent"]');
  await Promise.all([
    ok.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ok.click('button[type="submit"]'),
  ]);
  const sent = await ok.evaluate(() => document.body.innerText.toLowerCase());
  const configured = Boolean(process.env.DFEND_FORM_WEBHOOK);
  if (configured) {
    check(sent.includes("message sent"), "avec un crochet configure, l'envoi aboutit");
  } else {
    check(
      sent.includes("could not send") && sent.includes("aa@dfend.swiss"),
      "sans crochet configure, l'envoi echoue franchement et rend l'adresse",
      "definir DFEND_FORM_WEBHOOK avant la mise en ligne — todo.md #4",
    );
  }
  await ok.close();

  /* L'URL de destination ne doit jamais partir dans le paquet du navigateur.
   * On relit tous les fragments servis avec la page. */
  const bundle = await open(browser);
  const res = await bundle.goto(BASE + "/", { waitUntil: "networkidle2" });
  const html = await res.text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) =>
    new URL(m[1], BASE).href,
  );
  let leaked = [];
  for (const url of scripts) {
    const body = await (await fetch(url)).text();
    if (/DFEND_FORM_WEBHOOK|DFEND_FORM_TOKEN/.test(body)) leaked.push(url.split("/").pop());
  }
  check(
    leaked.length === 0,
    "ni l'URL de destination ni le jeton ne partent dans le navigateur",
    leaked.join(", "),
  );
  await bundle.close();
}

/* --- lancement ------------------------------------------------------------ */

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
  ],
});

line(`\ndfend.swiss — passes de verification sur ${BASE}`);
try {
  await passReveals(browser);
  await passMobile(browser);
  await passSystem(browser);
  await passMenu(browser);
  await passContrast(browser);
  await passContrastOnPhoto(browser);
  await passMotionAndTargets(browser);
  await passNoJs(browser);
  await passIntro(browser);
  await passMeta(browser);
  await passContent(browser);
  await passFold(browser);
  await passWeight(browser);
  await passForm(browser);
} finally {
  await browser.close();
}

line(
  "\n" +
    (failures === 0
      ? "toutes les passes sont vertes"
      : `${failures} controle(s) en echec`),
);
process.exit(failures === 0 ? 0 : 1);
