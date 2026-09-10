"use client";

/* Le fond du heros : un plan genere sur Higgsfield, en boucle, derriere le titre.
 *
 * Le client a d'abord fait poser ici deux extraits de son film promo
 * (`0910.mp4` puis `0910(3).mp4`, plan d'atrium avec visage et filigrane), et
 * les a rejetes le 2026-09-10 au profit du plan genere pour la section « off
 * the field » : un parent qui porte un enfant sur ses epaules dans un champ,
 * de dos, en silhouette. Aucun visage — la regle du projet sur les visuels de
 * synthese tient. Le meme plan sert donc le heros et la section plus bas.
 *
 * Le clip source est en portrait ; il est recadre 720x640 autour de la
 * silhouette (ciel au-dessus, herbe en dessous) avant d'etre monte en 1280 de
 * large. La queue est recollee sur la tete par un fondu de 0,6 s : la boucle
 * de 3,4 s est franche, sans raccord visible.
 *
 * Deux raisons de ne pas servir la video a tout le monde :
 * — sous `prefers-reduced-motion`, on s'arrete sur l'affiche ;
 * — le rendu serveur sert l'affiche, donc le premier rendu client sert la
 *   meme chose et la reconciliation ne trouve rien a redire.
 *
 * Le telephone recoit la copie `header-960` (185 Ko), `preload="metadata"` :
 * le corps n'arrive qu'au moment de lire, et `poster` tient l'ecran jusque-la.
 *
 * Le voile est un aplat, pas un degrade : le projet n'en a aucun, et surtout
 * un aplat se mesure. La passe 6 lit les pixels reellement peints sous le
 * titre et sous le bouton, image par image.
 */

import { useEffect, useState } from "react";

const POSTER = "/img/header-poster-1280.webp";
const ALT =
  "A parent carrying a child on their shoulders through a wide grass field at dusk, seen from behind in silhouette, black and white";

export default function HeroBackdrop() {
  const [motion, setMotion] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mid = window.matchMedia("(min-width: 1200px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      setMotion(!still.matches);
      setNarrow(!mid.matches);
    };
    decide();
    for (const q of [mid, still]) q.addEventListener("change", decide);
    return () => {
      for (const q of [mid, still]) q.removeEventListener("change", decide);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
      {motion ? (
        <video
          key={narrow ? "960" : "1280"}
          className="h-full w-full object-cover"
          poster={POSTER}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={ALT}
        >
          <source src={narrow ? "/video/header-960.mp4" : "/video/header-1280.mp4"} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER}
          srcSet="/img/header-poster-640.webp 640w, /img/header-poster-1280.webp 1280w"
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
        />
      )}
      {/* Un seul voile d'encre, plat et sur toute la largeur, meme valeur
          partout. Pas de degrade : le projet n'en a aucun, et un aplat se
          mesure. Il est calibre sur le point le plus clair du plan — le ciel
          de fin de journee au-dessus de la ligne d'horizon. La passe 6 le
          verifie a cinq instants de la boucle. */}
      <div className="absolute inset-0 bg-ink/75" />
    </div>
  );
}
