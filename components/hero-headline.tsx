"use client";

/* Le titre de l'accueil, en une seule prise avec l'ouverture.
 *
 * La sequence d'entree est un seul mouvement : la lettre se presente, le
 * rideau se retire sur l'entaille a 41 degres, et la promesse remonte
 * derriere sa coupe. Trois effets separes feraient trois effets. Enchaines,
 * ils font une arrivee.
 *
 * Regle du projet : le rendu serveur sert la phrase en clair. La version
 * animee ne se monte qu'une fois la page vivante, et jamais sous
 * `prefers-reduced-motion`. Sans JavaScript, il reste un titre.
 */

import { useEffect, useState } from "react";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { INTRO_KEY } from "@/lib/intro";

export default function HeroHeadline({ children }: { children: string }) {
  const [animated, setAnimated] = useState(false);
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Si l'intro joue, la phrase attend que le rideau soit parti. Sinon elle
     * remonte tout de suite : un visiteur qui revient sur l'accueil n'a pas a
     * patienter derriere une animation qu'il ne verra pas. */
    let playing = false;
    try {
      playing = window.sessionStorage.getItem(INTRO_KEY) !== "done";
    } catch {
      playing = false;
    }
    setDelay(playing ? 1.15 : 0.1);
    setAnimated(true);
  }, []);

  if (!animated) return <>{children}</>;

  return (
    <VerticalCutReveal
      splitBy="characters"
      staggerDuration={0.012}
      staggerFrom="first"
      transition={{ type: "spring", stiffness: 190, damping: 23, delay }}
    >
      {children}
    </VerticalCutReveal>
  );
}
