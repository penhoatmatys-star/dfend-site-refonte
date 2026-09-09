"use client";

/* 21st.dev — « Coverflow Carousel ».
 *
 * Six changements par rapport a l'original, tous imposes par ce projet-ci :
 *
 * — **Il rend quelque chose sans JavaScript.** L'original pose ses cartes en
 *   `position:absolute` et ne leur donne une place qu'en peignant des
 *   `transform` au rAF : sans JavaScript, les six s'empilent au meme endroit.
 *   Ici la mise en page absolue n'arrive qu'avec `ready`, pose dans un
 *   `useLayoutEffect` — donc apres l'hydratation et avant la premiere peinture,
 *   sans saut visible. Tant qu'il est faux, les cartes sont un rang qui defile,
 *   entier et lisible. C'est la regle du projet et la passe 8 la mesure.
 * — **Rayon zero.** `rounded-2xl` retire.
 * — **La pagination porte les intitules, pas des pastilles.** L'accordeon
 *   qu'il remplace affichait les six noms de prestation en permanence. Six
 *   points gris auraient cache cinq noms sur six : ce sont des prestations
 *   vendues, pas des diapositives d'un album. Les noms restent, et cliquer sur
 *   l'un centre sa carte.
 * — **Les images sont en noir et blanc**, comme toutes les photos du site.
 * — **`prefers-reduced-motion` coupe le glissement**, pas la navigation : la
 *   carte demandee arrive, elle n'y va pas en glissant. Le rAF s'arretait sur
 *   un seuil, la media query CSS du projet ne l'aurait jamais vu.
 * — L'anneau de focus est celui du site : 3 px, decale de 3 px.
 */

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title: string;
}

export interface CoverflowCarouselProps {
  slides: readonly CoverflowSlide[];
  /** Degres d'inclinaison de la premiere voisine. */
  rotate?: number;
  /** Recul de la premiere voisine, en fraction de la largeur d'une carte. */
  depth?: number;
  /** Distance de l'oeil, en multiple de la largeur d'une carte. */
  perspective?: number;
  /** Exposant sur la distance. Sous 1, l'inclinaison s'attenue vers l'exterieur. */
  falloff?: number;
  /** Opacite perdue par cran depuis le centre. */
  fade?: number;
  /** Une longueur CSS. Tout le reste en decoule. */
  cardWidth?: string;
  /** Ecart entre deux cartes, en fraction de la largeur d'une carte. */
  gap?: number;
  loop?: boolean;
  /** Nomme le carrousel pour les technologies d'assistance. */
  label: string;
  className?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(200px, 26vw, 320px)",
  gap = 0.05,
  loop = true,
  label,
  className,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Index fractionnaire au centre. La seule source de verite. */
  const posRef = React.useRef(0);
  /** Ou vise le glissement en cours. Repartir de `pos` avalerait une touche
      pressee en vol, avant que l'arrondi ne bouge. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const stillRef = React.useRef(false);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  /* Faux au rendu serveur et au premier rendu client : les deux servent le
     meme rang statique, donc React ne rejoue pas l'arbre. */
  const [ready, setReady] = React.useState(false);

  /** Carte entiere la plus proche, repliee dans 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // On peint droit dans le DOM. Soixante rendus React par seconde recalculeraient
  // six cartes pour des nombres que React n'a jamais besoin de voir.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // On replie la distance du cote le plus court de l'anneau. C'est tout le
      // mecanisme de boucle : aucune carte clonee, aucun noeud deplace.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      // L'inclinaison et le recul s'attenuent vers l'exterieur : doubler la
      // distance n'en ajoute qu'environ la moitie. Une rampe lineaire fermait
      // la deuxieme carte ; celle-ci la garde lisible.
      const ramp = Math.pow(distance, falloff);
      // Plafonnee avant le profil pur, pour qu'une carte lointaine ne tourne
      // jamais le dos.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // Une carte est teleportee a l'oppose de l'anneau a exactement un
      // demi-tour : elle doit avoir disparu avant, sinon le saut se voit.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      // Mouvement reduit : la carte demandee est la, elle n'y va pas.
      if (stillRef.current) {
        posRef.current = target;
        paint();
        rafRef.current = null;
        return;
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        // Sortie exponentielle, pas un ressort : rien ici ne doit depasser.
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Par le plus court chemin, plutot qu'en deroulant tout l'anneau.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    // Cartes par seconde, pour le lancer.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // Un lancer porte, mais jamais au-dela de deux cartes.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  /* Le passage au relief. `useLayoutEffect` : apres l'hydratation, avant la
     peinture. La largeur d'une carte commande le pas, le recul et la
     perspective, donc c'est la seule chose a mesurer — et seulement quand la
     boite change vraiment. */
  useIsoLayoutEffect(() => {
    stillRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReady(true);
  }, []);

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!ready || !frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint, ready]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={frameRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (!ready) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(1);
          }
        }}
        className={cn(
          "py-s3 outline-none focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring",
          ready
            ? "cursor-grab overflow-hidden active:cursor-grabbing"
            : // Sans le relief, le rang defile et reprend la gouttiere du
              // site : sinon la premiere carte touche le bord de l'ecran.
              "overflow-x-auto px-[var(--edge)]",
        )}
        style={
          ready
            ? {
                perspective: `calc(var(--cf-card) * ${perspective})`,
                // Le glissement horizontal est a nous ; la page garde le vertical.
                touchAction: "pan-y",
              }
            : undefined
        }
      >
        <div
          className={cn(
            "select-none",
            ready ? "relative" : "flex gap-2",
          )}
          style={
            ready
              ? { height: "var(--cf-card)", transformStyle: "preserve-3d" }
              : undefined
          }
        >
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide.title}, ${index + 1} of ${count}`}
              className={cn(
                "aspect-square shrink-0 overflow-hidden bg-ink will-change-transform",
                ready && "absolute top-0 left-1/2",
              )}
              style={{ width: "var(--cf-card)" }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                width={900}
                height={900}
                sizes="(min-width: 860px) 26vw, 60vw"
                draggable={false}
                className="h-full w-full select-none object-cover grayscale"
              />
            </div>
          ))}
        </div>
      </div>

      {/* La pagination porte les intitules. Les six restent lisibles en
          permanence, celui de la carte centree est marque a l'encre pleine.
          Elle reprend la gouttiere du site alors que le carrousel saigne :
          les cartes lointaines doivent sortir par le bord de l'ecran, pas
          buter contre une marge. */}
      {/* Pas de `p-0` ici : `.wrap` pose la gouttiere en `padding-inline`, et
          une utilitaire Tailwind l'ecraserait — les utilitaires vivent dans un
          calque plus tardif que les composants. Le retrait par defaut de la
          liste est deja repris par cette meme gouttiere. */}
      <ul className="wrap mt-s3 m-0 flex list-none flex-wrap justify-center gap-x-2 gap-y-1">
        {slides.map((slide, index) => (
          <li key={slide.title}>
            <button
              type="button"
              aria-current={index === selected ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "label inline-flex min-h-11 items-center px-3 text-center transition-opacity duration-200 hover:opacity-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring",
                index === selected ? "opacity-100" : "opacity-45",
              )}
            >
              {slide.title}
              {index === selected ? (
                /* Le meme soulignement incline que l'onglet courant de
                   l'en-tete : l'entaille du n, a 41 degres. */
                <span
                  aria-hidden="true"
                  className="ml-2 inline-block h-3 w-[3px] bg-current"
                  style={{ transform: "skewX(-49deg)" }}
                />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CoverflowCarousel;
