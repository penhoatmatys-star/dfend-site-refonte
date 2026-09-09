import type { SVGProps } from "react";

/* Le combiné, tracé au trait, qui se dessine à l'arrivée.
 *
 * Deux écarts avec le composant fourni, et un seul est un choix.
 *
 * — **Le balisage d'origine ne compile pas.** Le `<path>` y est auto-fermé
 *   (`… />`) puis suivi d'un `<animate>` et d'un `</path>` : la balise est
 *   refermée deux fois. En JSX c'est une erreur de syntaxe. Le chemin porte
 *   donc son animation comme un enfant, ce qui était visiblement l'intention.
 *
 * — **Le tracé se fait en CSS, plus en SMIL.** `<animate>` est du SMIL : il
 *   ignore `prefers-reduced-motion`, que la feuille du projet neutralise sur
 *   les animations et les transitions CSS. Un visiteur qui a demandé qu'on
 *   arrête de bouger aurait vu ce trait se dessiner quand même. En CSS, la
 *   règle du projet l'attrape sans qu'on écrive une ligne de plus.
 *   L'état d'arrivée — `stroke-dashoffset: 0`, l'icône entière — est l'état de
 *   base, et l'animation part de 62 pour y revenir. Sous mouvement réduit
 *   comme sans animation du tout, l'icône est complète : c'est la même règle
 *   que le reste du site, rien ne doit dépendre du mouvement pour être là.
 */
export function PhoneIcon({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeDasharray="62"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="animate-draw-stroke"
        d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"
      />
    </svg>
  );
}

export default PhoneIcon;
