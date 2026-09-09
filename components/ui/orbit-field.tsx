"use client";

/* 21st.dev — « quantum-cloud-loader », reecrit.
 *
 * L'original est un chargeur : quatre pastilles rouge, bleue, jaune et verte
 * qui traversent une boite de 176 px sur des `@keyframes` CSS. On en garde le
 * principe — des corps de tailles differentes sur des periodes differentes,
 * des courbes longues, aucun changement de direction brusque — et rien
 * d'autre. Les quatre couleurs primaires ne sont pas celles de la marque, un
 * chargeur pose sur une page deja chargee ment sur ce qu'il montre, et une
 * animation CSS ne peut pas repondre au curseur.
 *
 * Ce qu'il montre ici : le systeme. Un point vert fixe au centre, la personne
 * qu'on protege, et six corps noirs en orbite, les expositions qu'on suit.
 * Six, comme les six objectifs de la liste juste en dessous. Le curseur
 * repousse les corps, et ils reviennent sur leur orbite : c'est la seule
 * chose que la piece affirme, et elle est vraie.
 *
 * Canvas et non CSS pour trois raisons : le curseur agit sur chaque corps,
 * six elements animes en CSS font six couches de composition, et une orbite
 * elliptique se calcule mieux qu'elle ne se decrit en keyframes.
 *
 * Sous `prefers-reduced-motion`, une seule image est peinte, a l'arret, et
 * elle porte la meme composition. La piece ne disparait pas, elle s'immobilise.
 * Hors ecran, la boucle s'arrete : rien ne tourne pour une section qu'on ne
 * regarde pas.
 *
 * Aucun texte, aucun chiffre. Sans JavaScript le canvas reste vide et la
 * section est complete sans lui : la liste des six objectifs porte le sens,
 * la piece l'illustre.
 */

import { useEffect, useRef } from "react";

type Body = {
  /* Demi-axes de l'ellipse, en fraction de la demi-largeur et de la
     demi-hauteur de la boite. */
  rx: number;
  ry: number;
  /* Periode en secondes, et phase de depart en tours. */
  period: number;
  phase: number;
  /* Inclinaison de l'ellipse, en radians. */
  tilt: number;
  radius: number;
  /* Deplacement courant sous l'effet du curseur, et sa vitesse. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

/* Six corps, comme les six objectifs. Les periodes sont volontairement sans
 * rapport simple entre elles : avec des multiples, les six repasseraient
 * ensemble au meme endroit et la figure aurait un temps mort. */
const BODIES: Omit<Body, "ox" | "oy" | "vx" | "vy">[] = [
  { rx: 0.98, ry: 0.34, period: 17.0, phase: 0.00, tilt: 0.06, radius: 4.5 },
  { rx: 0.74, ry: 0.94, period: 11.3, phase: 0.31, tilt: -0.22, radius: 7.0 },
  { rx: 0.46, ry: 0.70, period: 23.7, phase: 0.58, tilt: 0.34, radius: 3.5 },
  { rx: 0.88, ry: 0.62, period: 14.1, phase: 0.72, tilt: -0.09, radius: 5.5 },
  { rx: 0.28, ry: 0.34, period: 8.9, phase: 0.17, tilt: 0.5, radius: 3.0 },
  { rx: 0.62, ry: 0.50, period: 29.3, phase: 0.85, tilt: 0.17, radius: 9.0 },
];

const REACH = 130; // px : au-dela, le curseur ne pousse plus
const PUSH = 900; // force de la poussee
const SPRING = 5.5; // rappel vers l'orbite
const DAMP = 3.4; // amortissement du rappel

export default function OrbitField({
  className = "",
  label,
}: {
  className?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Les couleurs sont lues sur le document et non ecrites ici : la piece est
     * posee sur le papier aujourd'hui, elle heritera du vert ou de la nuit si
     * elle deménage, sans qu'on la retouche. */
    const styles = getComputedStyle(canvas);
    const ink = styles.getPropertyValue("--foreground").trim() || "#000";
    const lime = styles.getPropertyValue("--color-lime").trim() || "#c6d75b";
    const rule = styles.getPropertyValue("--border").trim() || "#0003";

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bodies: Body[] = BODIES.map((b) => ({ ...b, ox: 0, oy: 0, vx: 0, vy: 0 }));

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999, on: false };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* Les demi-axes du champ. La largeur est bornee a 2,2 fois la hauteur :
     * sans ce plafond, une colonne large etalait les six corps sur une bande
     * de dix pixels de haut et la figure se lisait comme une ligne pointillee,
     * pas comme un systeme. */
    const field = () => {
      const ay = height / 2 - 16;
      const ax = Math.min(width / 2 - 16, ay * 2.6);
      return { cx: width / 2, cy: height / 2, ax, ay };
    };

    /* La position d'un corps : un point sur son ellipse, tournee de `tilt`,
     * plus le deplacement que le curseur lui a impose. */
    const at = (
      body: Body,
      time: number,
      cx: number,
      cy: number,
      ax: number,
      ay: number,
    ) => {
      const turn = (time / body.period + body.phase) * Math.PI * 2;
      const ex = Math.cos(turn) * ax * body.rx;
      const ey = Math.sin(turn) * ay * body.ry;
      const cos = Math.cos(body.tilt);
      const sin = Math.sin(body.tilt);
      return {
        x: cx + ex * cos - ey * sin + body.ox,
        y: cy + ex * sin + ey * cos + body.oy,
      };
    };

    const paint = (time: number) => {
      const { cx, cy, ax, ay } = field();
      ctx.clearRect(0, 0, width, height);

      /* Boite sans surface : ca arrive a la premiere image quand la section
       * est encore sous le rideau de l'ouverture, `display:none`, donc mesuree
       * a 0x0. `field()` rend alors des demi-axes negatifs, et `ctx.ellipse`
       * jette `IndexSizeError` sur un rayon negatif. On ne peint rien tant
       * qu'il n'y a pas de place ; le ResizeObserver repeint des qu'il y en a. */
      if (ax <= 0 || ay <= 0) return;

      /* Les six orbites sont TRACEES, d'un filet. C'est ce qui a change la
         piece : avec les seuls corps, la figure se lisait comme six points
         semes au hasard, et une capture prise au mauvais instant les montrait
         tous groupes. Avec la trajectoire dessinee, on voit ou chaque corps va
         meme sur une image fixe — et surtout on voit l'ecart quand le curseur
         le pousse hors de sa piste, puis le retour. C'est tout le sujet. */
      ctx.lineWidth = 1;
      for (const body of bodies) {
        ctx.strokeStyle = rule;
        ctx.beginPath();
        ctx.ellipse(cx, cy, ax * body.rx, ay * body.ry, body.tilt, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const body of bodies) {
        const { x, y } = at(body, time, cx, cy, ax, ay);
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(x, y, body.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Le point fixe, en dernier : il passe devant les pistes. Un anneau
         large, un disque plein, un coeur perce — trois cernes, pour qu'il ne
         puisse pas se confondre avec un corps. */
      ctx.strokeStyle = lime;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = lime;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = styles.getPropertyValue("--background").trim() || "#fff";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;

      const { cx, cy, ax, ay } = field();
      for (const body of bodies) {
        const { x: bx, y: by } = at(body, time, cx, cy, ax, ay);

        if (pointer.on) {
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < REACH) {
            const strength = (1 - distance / REACH) ** 2;
            body.vx += (dx / distance) * strength * PUSH * dt;
            body.vy += (dy / distance) * strength * PUSH * dt;
          }
        }

        // Rappel elastique amorti vers l'orbite : `ox` et `oy` reviennent a 0.
        body.vx += (-SPRING * body.ox - DAMP * body.vx) * dt * 10;
        body.vy += (-SPRING * body.oy - DAMP * body.vy) * dt * 10;
        body.ox += body.vx * dt;
        body.oy += body.vy * dt;
      }

      paint(time);
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || still.matches) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };

    resize();
    // Une image posee tout de suite : sous mouvement reduit c'est la seule,
    // et sinon elle evite un canvas vide avant la premiere frame.
    paint(0);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    });
    observer.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) paint(0);
    });
    ro.observe(canvas);

    const onStill = () => {
      stop();
      if (!still.matches) start();
      else paint(0);
    };
    still.addEventListener("change", onStill);
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      observer.disconnect();
      ro.disconnect();
      still.removeEventListener("change", onStill);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={`block h-[196px] w-full touch-none sm:h-[232px] ${className}`}
    />
  );
}
