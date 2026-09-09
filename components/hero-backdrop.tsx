"use client";

/* Le fond du heros : vingt secondes de stade, en boucle, derriere le titre.
 *
 * Cinq plans de cinq secondes, montes bout a bout avec quatre fondus, puis un
 * cinquieme fondu qui recolle la fin sur le debut. La boucle est donc franche :
 * elle ne revient pas en arriere comme l'ancienne boucle d'herbe, et il n'y a
 * pas de raccord toutes les vingt secondes.
 *   herbe rase — ligne de touche — projecteur — pluie sur la piste — filet.
 *
 * Ce sont des plans generes, et ils ne representent personne. C'est la limite
 * du projet sur les visuels de synthese : une matiere, jamais un visage,
 * jamais un client. Une image generee presentee comme un client sur le site
 * d'un courtier serait un faux temoignage en image.
 *
 * Trois raisons de ne pas servir la video a tout le monde :
 * — sous `prefers-reduced-motion`, on s'arrete sur l'affiche ;
 * — en dessous de 860px on sert l'affiche aussi : 2,1 Mo pour un fond de
 *   decor sur un telephone en 4G n'est pas un arbitrage, c'est un oubli ;
 * — le rendu serveur sert l'affiche, donc le premier rendu client sert la
 *   meme chose et la reconciliation ne trouve rien a redire.
 *
 * Le voile est un aplat, pas un degrade : le projet n'en a aucun, et surtout
 * un aplat se mesure. La passe 6 lit les pixels reellement peints sous le
 * titre et sous le bouton, image par image.
 */

import { useEffect, useState } from "react";

const POSTER = "/img/stade-poster-1280.webp";
const ALT =
  "Stadium grass, a touchline, a floodlight, rain on a running track and a goal net, black and white";

export default function HeroBackdrop() {
  const [motion, setMotion] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 860px)");
    const mid = window.matchMedia("(min-width: 1200px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      setMotion(wide.matches && !still.matches);
      setNarrow(!mid.matches);
    };
    decide();
    for (const q of [wide, mid, still]) q.addEventListener("change", decide);
    return () => {
      for (const q of [wide, mid, still]) q.removeEventListener("change", decide);
    };
  }, []);

  return (
    <>
    <div aria-hidden="true" className="cut-hero absolute inset-0 overflow-hidden bg-night">
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
          <source src={narrow ? "/video/stade-960.mp4" : "/video/stade-1280.mp4"} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER}
          srcSet="/img/stade-poster-640.webp 640w, /img/stade-poster-1280.webp 1280w"
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
        />
      )}
      {/* Un seul voile d'encre, plat et sur toute la largeur.
          Il y en a eu deux un moment, le second double sur les 68% de gauche
          ou vit le texte, pour garder l'image plus claire a droite. La couture
          verticale se voyait a l'oeil nu sur l'herbe : deux aplats voisins ne
          se fondent pas, et le projet n'a pas de degrade pour les raccorder.
          Un seul voile, donc, calibre sur le cas le plus dur — le projecteur
          du plan 3. La passe 6 le mesure a cinq instants de la boucle. */}
      <div className="absolute inset-0 bg-ink/75" />
    </div>
    {/* Le vert du bas-droit. C'est le seul geste de marque du premier ecran,
        et c'est l'entaille du n a l'echelle de la page : la coupe entre deux
        sols, usage numero un des cinq. */}
    <div aria-hidden="true" className="cut-hero-wedge absolute inset-0 bg-lime" />
    </>
  );
}
