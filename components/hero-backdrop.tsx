"use client";

/* Le fond du heros : une boucle de 9,6 secondes en va-et-vient, derriere le titre.
 *
 * Le client a fourni `0910(3).mp4` le 2026-09-10 et a demande de le poser en
 * fond du premier ecran, en toute connaissance de ce qu'il porte : c'est un
 * extrait de son film promo, avec un visage et le filigrane « dfend group »
 * au centre. C'est un ecart explicite a la regle du projet sur les visuels de
 * synthese (une matiere, jamais un visage) : l'ecart est celui du client,
 * consigne ici.
 *
 * Seul le plan d'ouverture est retenu — l'atrium, en plein cadre — parce que
 * la suite du film est en portrait avec des bandes noires et un aplat lime
 * grave dessus, illisible en fond pleine largeur. Ce plan est un lent
 * travelling avant : recolle bout a bout il « sautait en arriere » toutes les
 * quatre secondes. Il est donc joue en va-et-vient, avant puis a l'envers, et
 * revient exactement sur sa premiere image. Aucun fondu, aucun raccord.
 *
 * Deux raisons de ne pas servir la video a tout le monde :
 * — sous `prefers-reduced-motion`, on s'arrete sur l'affiche ;
 * — le rendu serveur sert l'affiche, donc le premier rendu client sert la
 *   meme chose et la reconciliation ne trouve rien a redire.
 *
 * Le telephone recoit la copie `header-960` (160 Ko), `preload="metadata"` :
 * le corps n'arrive qu'au moment de lire, et `poster` tient l'ecran jusque-la.
 *
 * Le voile est un aplat, pas un degrade : le projet n'en a aucun, et surtout
 * un aplat se mesure. La passe 6 lit les pixels reellement peints sous le
 * titre et sous le bouton, image par image.
 */

import { useEffect, useState } from "react";

const POSTER = "/img/header-poster-1280.webp";
const ALT =
  "A footballer sitting on the ground lacing their boots in a leafy courtyard, black and white";

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
      {/* Un seul voile d'encre, plat et sur toute la largeur. Pas de degrade :
          le projet n'en a aucun, et un aplat se mesure. Il est calibre sur le
          point le plus clair de l'atrium — les trouees de ciel en haut a
          droite. La passe 6 le verifie a cinq instants de la boucle.
          Sur mobile le texte occupe toute la largeur et passe donc pile sur le
          filigrane « dfend group » du film : le voile y est un cran plus
          dense pour que la lede reste lisible. */}
      <div className="absolute inset-0 bg-ink/92 md:bg-ink/75" />
    </div>
  );
}
