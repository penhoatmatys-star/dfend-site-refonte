/* La marque de telechargement.
 *
 * L'icone de fleche vers le bas est le pictogramme le plus banal du web. Ici
 * elle est tracee, pas importee, pour une seule raison : sa pointe porte
 * l'angle du site. Les deux branches descendent a 41 degres de l'horizontale
 * — 6,1 de chute pour 7 de base, tan = 0,869 — le meme angle que l'entaille
 * du `n`, que la coupe des sols et que le soulignement de l'onglet courant.
 * Une fleche plus large et plus plate que celle de n'importe quelle librairie,
 * et c'est exactement ce qui la rend reconnaissable.
 *
 * Le trait du bas est le plateau : la fleche descend dessus au survol, il ne
 * bouge pas. Deux proprietes animees, `transform` et rien d'autre.
 */
export default function DownloadMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      <g className="transition-transform duration-200 ease-out group-hover:translate-y-[2px]">
        <path d="M12 3v12" />
        <path d="M5 8.9 12 15l7-6.1" />
      </g>
      <path d="M4 21h16" />
    </svg>
  );
}
