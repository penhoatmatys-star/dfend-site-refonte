"use client";

/* 21st.dev — « Expand Map », repris pour le pied de page.
 *
 * Le geste de l'original est garde : une plaque qui repond au curseur, et qui
 * s'ouvre au clic sur une carte. Ce qu'elle ouvre a change, et c'est le point
 * important.
 *
 * **L'original dessine une fausse ville.** Deux avenues, quatre rues, six
 * immeubles et une epingle, tous inventes, sous le nom de la vraie adresse.
 * Poser un plan fabrique sous « via Balestra 10, 6900 Lugano » sur le site
 * d'un courtier, c'est publier une information fausse a l'endroit precis ou
 * un visiteur vient en chercher une vraie. C'est la meme regle que les faux
 * temoignages : le trace SVG ne survit pas, et la carte de Google prend sa
 * place.
 *
 * Ce qui reste de l'original : le basculement au curseur, le ressort de
 * l'ouverture, l'invite « click to expand », le releve des coordonnees, et le
 * point qui dit que le bureau existe. Ce qui part avec le faux plan :
 * l'emeraude `#34D399`, qui n'est pas une couleur de la marque, et l'etiquette
 * « live », qui n'annoncait rien de mesurable. Les coins passent a zero.
 *
 * L'iframe n'arrive qu'a l'ouverture — comme dans `map-embed`, qu'il remplace.
 * Tant que personne ne demande la carte, Google ne recoit ni cookie ni IP.
 */

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

export interface LocationMapProps {
  /** Le libelle du lieu, tel qu'il est publie ailleurs sur le site. */
  location: string;
  /* La seconde ligne. L'original y met des coordonnees en degres ; ici c'est
     la rue. Le site ne publie pas de latitude, et la deduire d'un numero de
     rue au dixieme de seconde pres serait un chiffre invente de plus. La rue,
     elle, est ecrite dans le pied de page depuis le premier jour. */
  detail: string;
  /** L'encart Google, en `output=embed`. */
  src: string;
  /** Le titre de l'iframe, pour les technologies d'assistance. */
  title: string;
  className?: string;
}

export function LocationMap({
  location,
  detail,
  src,
  title,
  className = "",
}: LocationMapProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [still, setStill] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  /* Lu dans un effet et non dans l'initialisateur de `useState` : sinon le
     rendu serveur et le premier rendu client divergent. */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setStill(query.matches);
    decide();
    query.addEventListener("change", decide);
    return () => query.removeEventListener("change", decide);
  }, []);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  /* Trois degres, pas huit. L'original bascule une vignette de 240 px ; ici la
     plaque fait toute la colonne, et au-dela de trois degres un bord entier
     part en biais sous le texte d'a cote. */
  const tiltX = useTransform(pointerY, [-160, 160], [3, -3]);
  const tiltY = useTransform(pointerX, [-320, 320], [-3, 3]);
  const springX = useSpring(tiltX, { stiffness: 300, damping: 30 });
  const springY = useSpring(tiltY, { stiffness: 300, damping: 30 });

  const onPointerMove = (event: React.PointerEvent) => {
    if (still || open || !boxRef.current) return;
    const box = boxRef.current.getBoundingClientRect();
    pointerX.set(event.clientX - (box.left + box.width / 2));
    pointerY.set(event.clientY - (box.top + box.height / 2));
  };

  const rest = () => {
    pointerX.set(0);
    pointerY.set(0);
    setHovered(false);
  };

  return (
    <div
      ref={boxRef}
      className={`relative ${className}`}
      style={{ perspective: 1200 }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={rest}
    >
      <motion.div
        className="relative overflow-hidden border border-rule-chalk bg-night"
        style={{
          rotateX: still ? 0 : springX,
          rotateY: still ? 0 : springY,
          transformStyle: "preserve-3d",
        }}
        animate={{ height: open ? 540 : 360 }}
        initial={false}
        transition={
          still
            ? { duration: 0 }
            : { type: "spring", stiffness: 320, damping: 34 }
        }
      >
        <AnimatePresence>
          {open ? (
            <motion.iframe
              key="map"
              src={src}
              title={title}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: still ? 0 : 0.4, delay: still ? 0 : 0.1 }}
              /* Les tuiles de Google sont claires et colorees. `grayscale`
                 puis `invert` retourne le fond blanc en sombre en gardant les
                 routes et les libelles lisibles. */
              className="absolute inset-0 h-full w-full border-0 grayscale invert"
            />
          ) : null}
        </AnimatePresence>

        {/* Le bouton couvre la plaque tant qu'elle est fermee. Une fois la
            carte posee, il se retire : un calque transparent au-dessus d'une
            iframe interceptera toujours le premier clic destine a la carte. */}
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group absolute inset-0 flex cursor-pointer flex-col justify-between p-s3 text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-lime"
          >
            {/* Le pictogramme de l'original, garde : un plan plie. Sans
                l'etiquette « head office » qui l'accompagnait : la colonne
                d'a cote porte deja ce titre, et deux fois le meme mot cote a
                cote se lit comme une erreur de montage. */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
              className="h-5 w-5 text-lime"
            >
              <path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3z" />
              <path d="M9 3v18M15 6v18" />
            </svg>

            <span className="block">
              <span
                className="block font-sans text-lg lowercase [font-variation-settings:'wdth'_112,'wght'_800] [letter-spacing:-0.02em]"
                style={{
                  transform: hovered && !still ? "translateX(4px)" : "none",
                  transition: "transform 240ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                {location}
              </span>
              <span className="label mt-1 block text-chalk-soft">
                {detail}
              </span>
              {/* Le filet reprend l'entaille du n plutot qu'un degrade : le
                  projet n'en a aucun. Il s'etire au survol. */}
              <span
                aria-hidden="true"
                className="mt-s2 block h-px origin-left bg-lime transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${hovered ? 1 : 0.22})` }}
              />
              <span className="label mt-s2 inline-flex min-h-11 items-center border border-rule-chalk px-4 text-chalk transition-colors duration-200 group-hover:border-lime group-hover:bg-lime group-hover:text-ink">
                open the map
              </span>
            </span>
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

export default LocationMap;
