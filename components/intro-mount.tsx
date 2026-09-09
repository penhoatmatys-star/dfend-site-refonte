"use client";

/* Le portier de l'ouverture.
 *
 * C'est ici que la decision se prend, et nulle part ailleurs : session deja
 * vue, mouvement reduit, WebGL absent. Tant qu'elle n'est pas prise, le
 * paquet de l'intro — et donc three.js — n'est pas telecharge. Le charger
 * pour decider ensuite de ne pas jouer, c'est faire payer a chaque page
 * interieure une animation que personne ne verra.
 *
 * L'intro n'existe qu'au navigateur : rendue au serveur, elle enverrait un
 * rideau vert dans le HTML, que les visiteurs sans JavaScript ne pourraient
 * jamais retirer.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { INTRO_PENDING, markIntroPlayed, shouldPlayIntro } from "@/lib/intro";
import { hasWebGL } from "@/lib/webgl";

const GlyphIntro = dynamic(() => import("./glyph-intro"), { ssr: false });

export default function IntroMount() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (shouldPlayIntro() && hasWebGL()) {
      setPlay(true);
      return;
    }
    // Conditions non reunies : on retire ce que le script d'amorce a pose et
    // la page reprend sa vie normale, sans avoir rien telecharge.
    document.documentElement.classList.remove(INTRO_PENDING);
    markIntroPlayed();
  }, []);

  if (!play) return null;
  return <GlyphIntro />;
}
