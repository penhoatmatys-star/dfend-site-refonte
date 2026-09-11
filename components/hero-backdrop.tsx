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
 * 20,000 s exactement, et la boucle repart sans raccord visible. Les trois
 * copies ci-dessous sont des reechelonnages de ce meme montage : elles font
 * toutes 480 images et bouclent donc aussi franchement.
 *
 * Ce sont des plans generes, et ils ne representent personne. C'est la limite
 * du projet sur les visuels de synthese : une matiere, jamais un visage,
 * jamais un client. Une image generee presentee comme un client sur le site
 * d'un courtier serait un faux temoignage en image.
 *
 * TROIS COPIES, ET LA PLUS PETITE EST CADREE POUR UN TELEPHONE.
 * La video tourne maintenant sur mobile aussi (demande du client, 2026-09-10).
 * Elle y avait ete coupee parce que la copie etroite pesait 1,66 Mo, ce qui
 * n'est pas un fond de decor mais un forfait data. La reponse n'est pas de
 * retirer la barriere et d'envoyer ce fichier quand meme :
 *
 *   < 640 px   stade-mobile   480x640, recadre 3:4 au centre, 597 Ko
 *   640-1199   stade-960      960x540, 1,66 Mo
 *   >= 1200    stade-1280     1280x720, 2,19 Mo
 *
 * Le recadrage 3:4 n'est pas cosmetique, il est le gain. Le heros d'un
 * telephone fait environ 375x600, soit un rapport de 0,62 ; un plan 16:9 qui
 * le couvre jette les deux tiers de sa largeur et doit etre agrandi 1,67 fois
 * en hauteur. Un plan 3:4 se pose presque a l'echelle 1 et ne perd que 17 %.
 * A poids egal on a donc une image nette au lieu d'une image molle. Les cinq
 * plans supportent la coupe : le pylone du plan 3 reste entier, la ligne de
 * touche et le filet se lisent.
 *
 * Reste `prefers-reduced-motion`, qui coupe la video et laisse l'affiche.
 * Et si le telephone refuse la lecture automatique — iOS en mode economie
 * d'energie le fait — la balise `video` montre son `poster` toute seule,
 * c'est le comportement natif et il n'y a rien a ecrire pour l'obtenir.
 *
 * Le `picture` sert l'affiche assortie au palier des le premier rendu, sans
 * JavaScript : sinon le telephone peignait l'affiche large, puis la remplacait
 * par la portrait une fois l'effet passe, et le cadrage sautait.
 *
 * Le voile est un aplat, pas un degrade : le projet n'en a aucun, et surtout
 * un aplat se mesure. 75 % est calibre sur le cas le plus dur de la boucle, le
 * projecteur du plan 3 : le pire pixel de fond sous le titre monte a 64/255,
 * ce qui donne 6,52:1 pour le vert de marque et 10,37:1 pour le blanc. La
 * passe 6 le relit a cinq instants, un par plan.
 */

import { useEffect, useState } from "react";

const ALT =
  "Stadium grass, a touchline, a floodlight, rain on a running track and a goal net, black and white";

const WIDE = { src: "/video/stade-1280.mp4", poster: "/img/stade-poster-1280.webp" };
const MID = { src: "/video/stade-960.mp4", poster: "/img/stade-poster-1280.webp" };
const MOBILE = { src: "/video/stade-mobile.mp4", poster: "/img/stade-poster-mobile.webp" };

type Tier = "still" | "mobile" | "mid" | "wide";

export default function HeroBackdrop() {
  /* « still » au depart, des deux cotes : c'est ce que rend le serveur, donc
   * le premier rendu client rend la meme chose et la reconciliation ne trouve
   * rien a redire. La decision se prend dans l'effet, jamais dans
   * l'initialisateur d'un useState. */
  const [tier, setTier] = useState<Tier>("still");

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 639px)");
    const wide = window.matchMedia("(min-width: 1200px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      if (still.matches) setTier("still");
      else if (phone.matches) setTier("mobile");
      else if (wide.matches) setTier("wide");
      else setTier("mid");
    };
    decide();
    for (const q of [phone, wide, still]) q.addEventListener("change", decide);
    return () => {
      for (const q of [phone, wide, still]) q.removeEventListener("change", decide);
    };
  }, []);

  const rendition =
    tier === "mobile" ? MOBILE : tier === "mid" ? MID : WIDE;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-night">
      {tier === "still" ? (
        <picture>
          {/* Le telephone recoit l'affiche portrait, cadree comme sa video. */}
          <source media="(max-width: 639px)" srcSet={MOBILE.poster} />
          <source
            srcSet="/img/stade-poster-640.webp 640w, /img/stade-poster-1280.webp 1280w"
            sizes="100vw"
          />
          {/* `next/image` ne sait pas servir un `picture` a sources multiples,
              et la regle no-img-element ne se declenche pas ici : l'element
              est le repli d'un `picture`, pas une image posee seule. */}
          <img
            src={WIDE.poster}
            alt=""
            className="h-full w-full object-cover"
          />
        </picture>
      ) : (
        <video
          // La cle force le remontage au changement de palier : sans elle,
          // React garde l'element et le navigateur ignore le nouveau `source`.
          key={tier}
          className="h-full w-full object-cover"
          poster={rendition.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={ALT}
        >
          <source src={rendition.src} type="video/mp4" />
        </video>
      )}
      {/* Un seul voile d'encre, plat et sur toute la largeur, meme valeur
          partout. Il y en a eu deux un moment, le second double sur la gauche
          ou vit le texte : la couture verticale se voyait a l'oeil nu sur
          l'herbe du plan 1, et le site n'a pas de degrade pour la raccorder. */}
      <div className="absolute inset-0 bg-ink/75" />
    </div>
  );
}
