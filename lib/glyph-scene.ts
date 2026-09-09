/* Le mot-symbole dfend en volume.
 *
 * Le glyphe vient de `lib/glyph.ts`, trace sur le logo 1600x1600. On l'extrude,
 * on l'eclaire, et c'est tout : l'objet est noir sur un sol vert, comme le
 * verrou de logo. L'entaille a 41 degres est le seul angle du site, et la
 * rotation existe pour la montrer.
 *
 * Le moteur ne tient aucune boucle de rendu. L'appelant appelle `render()`
 * quand quelque chose a bouge : une intro dure une seconde et demie, une
 * charniere ne bouge qu'au scroll. Faire tourner un requestAnimationFrame en
 * permanence pour un objet immobile coute une batterie pour rien.
 */

import {
  AmbientLight,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  type BufferGeometry,
  type Shape,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLYPH_SVG, GLYPH_VIEWBOX } from "./glyph";

/* Le vert de marque et l'encre, en entiers, pour les lumieres. */
const LIME = 0xc7d65d;
const INK = 0x000000;

/* Profondeur en unites de viewBox : elle est posee avant la mise a l'echelle,
 * puisque ExtrudeGeometry travaille dans l'espace de la forme.
 *
 * Pas de chanfrein. Deux raisons. Le contour compte 746 points, donc des
 * segments de quelques unites : un chanfrein plus large qu'un segment se
 * replie sur lui-meme au sommet de l'arche. Et un chanfrein forme une suite
 * de facettes a une vingtaine de degres l'une de l'autre, que le lissage des
 * normales confond avec la face avant et etale en grands triangles sur toute
 * la lettre. L'arete vive est de toute facon plus juste ici : le seul rayon
 * de coin du site est zero. */
const DEPTH = 240;

let cachedGeometry: BufferGeometry | null = null;

/** Construit la geometrie une fois pour toutes les scenes de la page. */
function glyphGeometry(): BufferGeometry {
  if (cachedGeometry) return cachedGeometry;

  const parsed = new SVGLoader().parse(GLYPH_SVG);
  const shapes: Shape[] = [];
  for (const path of parsed.paths) {
    shapes.push(...SVGLoader.createShapes(path));
  }

  const geometry = new ExtrudeGeometry(shapes, {
    depth: DEPTH,
    bevelEnabled: false,
    curveSegments: 4,
  });

  // Le SVG compte les y vers le bas, three vers le haut : on retourne en
  // meme temps qu'on normalise sur une hauteur de 1.
  const s = 1 / GLYPH_VIEWBOX.height;
  geometry.scale(s, -s, s);
  geometry.center();

  /* Une normale par facette fait apparaitre des cotes le long de la paroi
   * d'extrusion, la ou l'arche est decoupee en segments de six degres. On
   * lisse sous 20 degres de cassure : la courbe s'adoucit, et les angles
   * droits — face avant contre paroi, fut, entaille — restent nets. */
  const creased = toCreasedNormals(geometry, MathUtils.degToRad(20));
  geometry.dispose();

  cachedGeometry = creased;
  return creased;
}

export type GlyphSceneOptions = {
  /** Fond transparent : le sol vert est peint en CSS, pas en WebGL. */
  canvas: HTMLCanvasElement;
  /** Distance de la camera. Plus grand = lettre plus petite. */
  distance?: number;
};

export class GlyphScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly pivot: Group;
  private readonly mesh: Mesh;
  private disposed = false;

  constructor({ canvas, distance = 2.75 }: GlyphSceneOptions) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearAlpha(0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(32, 1, 0.1, 20);
    this.camera.position.set(0, 0, distance);

    // Le pivot porte la rotation, le mesh porte l'inclinaison de repos :
    // l'appelant fait tourner un seul objet sans se soucier de l'assiette.
    this.pivot = new Group();
    this.mesh = new Mesh(
      glyphGeometry(),
      new MeshStandardMaterial({ color: INK, roughness: 0.42, metalness: 0 }),
    );
    this.pivot.add(this.mesh);
    this.scene.add(this.pivot);

    // Trois sources, et pas une de plus. L'ambiante est verte parce que
    // l'objet est pose sur du vert : c'est la lumiere que le sol renvoie.
    this.scene.add(new AmbientLight(LIME, 0.9));

    const key = new DirectionalLight(0xffffff, 2.4);
    key.position.set(-1.4, 1.8, 2.6);
    this.scene.add(key);

    // Le contre-jour vert detache la silhouette du fond et allume le
    // chanfrein de l'entaille au moment ou elle passe de profil.
    const rim = new DirectionalLight(LIME, 3.2);
    rim.position.set(2.2, -0.6, -1.8);
    this.scene.add(rim);
  }

  /** Oriente la lettre. `yaw` la fait tourner, `pitch` la penche. */
  setRotation(yaw: number, pitch = 0, roll = 0) {
    this.pivot.rotation.set(pitch, yaw, roll);
  }

  setScale(scale: number) {
    this.pivot.scale.setScalar(scale);
  }

  /** Recadre sur la taille reelle du canvas. A rappeler au redimensionnement. */
  resize(width: number, height: number) {
    if (this.disposed || width === 0 || height === 0) return;
    // Deux pixels par point suffisent : au-dela on paie sans que ca se voie.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;

    // La lettre garde la meme hauteur apparente quel que soit le format :
    // sur un ecran etroit on recule au lieu de la laisser deborder.
    const fit = MathUtils.clamp(1.15 / this.camera.aspect, 1, 2.1);
    this.camera.position.z = 2.75 * fit;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    (this.mesh.material as MeshStandardMaterial).dispose();
    this.renderer.dispose();
    // La geometrie est partagee entre les scenes de la page : on la garde.
  }
}

