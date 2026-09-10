"use client";

/* Le fond du heros : vingt secondes de stade, en boucle, derriere le titre.
 *
 * Cinq plans de cinq secondes, generes sur Higgsfield, montes bout a bout avec
 * quatre fondus, puis un cinquieme fondu qui recolle la fin sur le debut :
 *   herbe rase — ligne de touche — projecteur — pluie sur la piste — filet.
 *
 * Le montage est calcule, pas approche. A 24 images par seconde : cinq plans
 * de 115 images, quatre fondus de 19 images pour la chaine, plus un cinquieme
 * qui ramene la queue sur la tete. `5 x 115 - 5 x 19 = 480` images, soit
 * 20,000 s exactement, et la boucle repart sans raccord visible.
 *
 * Ce sont des plans generes, et ils ne representent personne. C'est la limite
 * du projet sur les visuels de synthese : une matiere, jamais un visage,
 * jamais un client. Une image generee presentee comme un client sur le site
 * d'un courtier serait un faux temoignage en image.
 *
 * Historique, parce qu'il explique les fichiers restes dans `public` : ce plan
 * a tenu le heros jusqu'au 2026-09-10, ou le client a fait poser a la place
 * deux extraits de son film promo (`0910.mp4` puis `0910(3).mp4`, atrium avec
 * visage et filigrane), puis le plan genere parent-enfant. Il l'a redemande le
 * meme jour. Le plan parent-enfant (`header-*`) sert toujours la section
 * « off the field » plus bas dans la page.
 *
 * Trois raisons de ne pas servir la video a tout le monde :
 * — sous `prefers-reduced-motion`, on s'arrete sur l'affiche ;
 * — en dessous de 860 px on sert l'affiche aussi. La copie etroite pese
 *   1,66 Mo la ou le plan parent-enfant qu'elle remplace en pesait 185 Ko :
 *   envoyer ca a un telephone en 4G pour un fond de decor n'est pas un
 *   arbitrage, c'est un oubli. L'affiche fait 40 Ko ;
 * — le rendu serveur sert l'affiche, donc le premier rendu client sert la
 *   meme chose et la reconciliation ne trouve rien a redire.
 *
 * Le voile est un aplat, pas un degrade : le projet n'en a aucun, et surtout
 * un aplat se mesure. 75 % est calibre sur le cas le plus dur de la boucle, le
 * projecteur du plan 3 : le pire pixel de fond sous le titre monte a 64/255,
 * ce qui donne 6,52:1 pour le vert de marque et 10,37:1 pour le blanc. La
 * passe 6 le relit a cinq instants, un par plan.
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
          <source
            src={narrow ? "/video/stade-960.mp4" : "/video/stade-1280.mp4"}
            type="video/mp4"
          />
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
      {/* Un seul voile d'encre, plat et sur toute la largeur, meme valeur
          partout. Il y en a eu deux un moment, le second double sur la gauche
          ou vit le texte : la couture verticale se voyait a l'oeil nu sur
          l'herbe du plan 1, et le site n'a pas de degrade pour la raccorder. */}
      <div className="absolute inset-0 bg-ink/75" />
    </div>
  );
}
