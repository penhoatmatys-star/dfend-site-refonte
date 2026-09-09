/* Les conditions d'ouverture de l'intro, en un seul endroit.
 *
 * Deux lecteurs s'en servent et doivent tomber d'accord : le script en ligne
 * dans le <head>, qui court avant la premiere peinture, et le composant qui
 * joue la scene. S'ils divergent, la page reste verte sur un ecran vide.
 */

export const INTRO_KEY = "dfend:intro";
export const INTRO_PENDING = "intro-pending";

/** Vrai si l'intro doit jouer maintenant. Cote navigateur uniquement. */
export function shouldPlayIntro(): boolean {
  try {
    if (window.sessionStorage.getItem(INTRO_KEY) === "done") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    // Un onglet ouvert en arriere-plan ne produit pas de frames : l'intro y
    // resterait figee sur un sol vert. On la marque jouee et on passe.
    if (document.hidden) return false;
    return true;
  } catch {
    return false;
  }
}

export function markIntroPlayed() {
  try {
    window.sessionStorage.setItem(INTRO_KEY, "done");
  } catch {
    // Navigation privee, stockage refuse : l'intro rejouera. Ce n'est pas
    // une raison de casser la page.
  }
}

/* Le script d'amorce ne vit plus ici : il est servi tel quel depuis
 * `public/intro-boot.js`, charge par <Script strategy="beforeInteractive">.
 * Un script en ligne rendu par React fait echouer l'hydratation, le serveur
 * ecrivant une balise que le client ne rend pas. Les deux fichiers doivent
 * s'accorder sur INTRO_KEY et INTRO_PENDING : la passe `intro` de
 * tests/run.mjs le verifie. */
export const INTRO_BOOT_SRC = "/intro-boot.js";
