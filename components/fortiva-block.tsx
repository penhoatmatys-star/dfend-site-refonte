"use client";

/* Le renvoi vers Fortiva Pro, en deuxieme position de l'accueil.
 *
 * Repris du site frere dfendinsurance.com, ou le meme bloc existe deja et ou
 * il a ete arbitre. Ce qu'on lui garde :
 *
 * — **Pas d'etiquette de marque, pas de titre d'affichage.** Toutes les autres
 *   sections s'ouvrent sur l'etiquette et le titre de dfend ; celle-ci est une
 *   autre societe du groupe. Le verrou Fortiva tient lieu des deux, et la
 *   section se lit comme un passage de relais et non comme une prestation
 *   dfend de plus. Le titre survit en `sr-only`, pour le plan du document et
 *   pour un lecteur d'ecran : sans lui la section n'a pas de nom.
 * — Le fond est `fortiva-signing.mp4`, le plan d'ouverture du film Fortiva Pro
 *   fourni par le client, le seul segment sans visage, desature. Il est monte
 *   par le site frere ; les deux copies doivent rester identiques.
 * — Le contenu occupe la colonne de gauche et l'image reste lisible a droite.
 *
 * Ce qu'on change : le double degrade de l'original devient deux aplats. Le
 * projet n'a aucun degrade, et un aplat se mesure — la passe 6 lit les pixels
 * sous le verrou et sous le bouton, image par image.
 *
 * Le lien sort du site. Il a d'abord ete traite en contour seul, le vert plein
 * etant garde pour le heros et l'envoi du formulaire ; le client a demande le
 * 2026-09-10 un bouton entierement lime. Le texte passe donc en encre : chalk
 * sur lime vaudrait 1.59:1, la combinaison interdite du projet.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandChevron } from "@/components/brand-button";
import { SITE } from "@/lib/content";

export default function FortivaBlock() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setMotion(!still.matches);
    decide();
    still.addEventListener("change", decide);
    return () => still.removeEventListener("change", decide);
  }, []);

  return (
    <section
      id="fortiva"
      className="on-night relative isolate scroll-mt-24 overflow-hidden bg-night py-[clamp(64px,9vw,104px)] text-chalk"
    >
      {motion ? (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src="/video/fortiva-signing.mp4" type="video/mp4" />
        </video>
      ) : null}

      {/* Un seul aplat d'encre, sur toute la largeur. Il y en a eu deux un
          moment, le second double sur la moitie gauche pour garder l'image
          plus claire a droite : la couture verticale se voyait a l'oeil nu au
          milieu du plan, exactement comme sur le heros. Deux aplats voisins ne
          se fondent pas, et le site n'a pas de degrade pour les raccorder.
          La passe 6 mesure le texte sur les pixels reels. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/72" />

      <div className="wrap grid grid-cols-1 items-center gap-s5 md:grid-cols-12">
        <div className="md:col-span-6">
          <h2 className="sr-only">Fortiva Pro</h2>

          {/* Les deux axes sont poses depuis le rapport du fichier detoure
              (900x373 = 2.413) : une image non decodee est un element de
              flux sans largeur propre et etirerait sa cellule le temps du
              chargement. */}
          <Image
            src="/img/logo-fortiva-pro.png"
            alt="Fortiva Pro"
            width={900}
            height={373}
            className="h-[100px] w-[241px] sm:h-[124px] sm:w-[300px] lg:h-[145px] lg:w-[350px]"
          />

          <p className="lede mt-s4">
            Mitigate and optimize your exposure with our own tool.
          </p>

          <a
            href={SITE.fortiva}
            rel="noopener noreferrer external"
            className="label group mt-s4 inline-flex min-h-11 items-center gap-3 border border-lime bg-lime px-5 py-3 text-ink transition-colors duration-200 hover:border-chalk hover:bg-chalk focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
          >
            enter &amp; apply
            <BrandChevron />
          </a>
        </div>
      </div>
    </section>
  );
}
