/* Le test de disponibilite de WebGL vit seul, loin de three.js.
 *
 * Il est appele tot, sur chaque page qui porte une scene, pour decider s'il
 * faut servir le glyphe a plat. Le laisser dans `glyph-scene.ts` obligeait a
 * importer three pour poser une question a laquelle le navigateur repond en
 * trois lignes, et faisait donc partir 200 ko avec la page.
 */

/** Vrai si le navigateur sait vraiment ouvrir un contexte WebGL. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
