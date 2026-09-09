"use client";

/* La bande des implantations, en defilement continu, sur un fond de stade.
 *
 * Onze villes, toutes relevees sur le site actuel : siege, bureaux du groupe,
 * bureaux partenaires. Rien n'est ajoute. Le defilement dit la portee mieux
 * qu'une carte, et il ne demande aucune image.
 *
 * Le fond est une boucle de sept secondes, generee : un travelling lateral
 * dans une tribune vide sous les projecteurs. Il est monte pour boucler sans
 * raccord — la queue est fondue sur la tete, 168 images a 24 i/s, 7,000 s
 * pile — et le mouvement de camera va dans le sens de la bande. 292 ko.
 *
 * Il ne represente personne : c'est la meme regle que le heros et que les six
 * matieres. Une tribune vide, pas une foule.
 *
 * Trois raisons de ne pas le servir a tout le monde : sous
 * `prefers-reduced-motion` la bande ne defile deja pas, donc une video
 * derriere n'aurait aucun sens ; en dessous de 860 px il part 292 ko pour un
 * fond a 30 % ; et le rendu serveur sert l'affiche, donc le premier rendu
 * client sert la meme chose.
 *
 * Le marquee vient de 21st.dev. Il se met en pause hors ecran et onglet cache,
 * et il ne bouge pas du tout sous `prefers-reduced-motion` : la liste reste
 * alors lisible a l'arret, ce qui suffit.
 */

import { useEffect, useState } from "react";
import { ScrollVelocityRow } from "@/components/ui/scroll-velocity-text";
import { CITIES } from "@/lib/content";

export default function OfficesBand() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 860px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setMotion(wide.matches && !still.matches);
    decide();
    wide.addEventListener("change", decide);
    still.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      still.removeEventListener("change", decide);
    };
  }, []);

  return (
    <section className="on-night relative isolate overflow-hidden border-y border-rule-chalk bg-night py-s5 text-chalk">
      {motion ? (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          poster="/img/tribune-bande-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src="/video/tribune-bande.mp4" type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/img/tribune-bande-poster.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      {/* Un seul aplat, sur toute la largeur. Les projecteurs du plan sont le
          point le plus clair du site : a 78 % d'encre, le pire pixel de fond
          reste sous 60/255 et le blanc des villes tient au-dela de 10:1. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/78" />

      <p className="label wrap mb-s3 text-chalk-soft" data-reveal>
        where we are
      </p>
      <ScrollVelocityRow baseVelocity={1.6} direction={-1}>
        {CITIES.map((city) => (
          <span
            key={city}
            className="font-sans mx-6 inline-flex items-center gap-6 text-xl lowercase [font-variation-settings:'wdth'_112,'wght'_800] [letter-spacing:-0.02em]"
          >
            {city}
            {/* Le separateur reprend l'angle du n plutot qu'une puce ronde. */}
            <span
              aria-hidden="true"
              className="inline-block h-4 w-px bg-lime"
              style={{ transform: "skewX(-49deg)" }}
            />
          </span>
        ))}
      </ScrollVelocityRow>
    </section>
  );
}
