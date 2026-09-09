/* Rideau d'ouverture : pose la classe avant la premiere peinture.
 *
 * Ce fichier est charge par <Script strategy="beforeInteractive"> et court
 * donc a l'analyse du document, avant tout module de l'application. Sans
 * JavaScript il ne court pas, la classe n'existe pas, et la page est entiere.
 * C'est la regle du projet : aucun etat initial n'est pose en CSS.
 *
 * Les deux chaines ci-dessous doivent rester d'accord avec `lib/intro.ts`.
 * La passe `intro` de tests/run.mjs verifie qu'elles n'ont pas divergé.
 */
(function () {
  try {
    var d = document.documentElement;
    if (sessionStorage.getItem("dfend:intro") === "done") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Un onglet ouvert en arriere-plan ne produit pas de frames : l'intro y
    // resterait figee sur un sol vert.
    if (document.hidden) return;
    if (!window.WebGLRenderingContext) return;

    d.classList.add("intro-pending");

    // Chien de garde. Si le paquet ne monte jamais, ou si WebGL tombe au
    // dernier moment, la page doit revenir seule.
    setTimeout(function () {
      d.classList.remove("intro-pending");
    }, 3500);
  } catch (e) {
    /* stockage refuse, navigation privee : on ne masque rien */
  }
})();
