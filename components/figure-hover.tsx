"use client";

/* Une figure qui ne bouge qu'au regard.
 *
 * Adapte de `hover-video` du site frere dfendinsurance.com. Le reste du site
 * joue sa video en fond, a 25 % de luminosite ; celle-ci est au premier plan
 * et a pleine echelle. La lancer toute seule mettrait un objet en mouvement
 * dans le coin d'une page par ailleurs immobile. Elle reste donc sur son
 * affiche, part au survol ou au focus clavier, et un clic la fixe : sans
 * survol, un visiteur tactile a quand meme un moyen de la lancer.
 *
 * Trois ecarts a l'original :
 *   — la coupe a 41 degres remplace le cadre a filet, c'est le traitement de
 *     toutes les images du site ;
 *   — le double degrade de l'original devient un aplat, le projet n'en a
 *     aucun, et il ne sert ici qu'a poser l'etiquette ;
 *   — la legende reste SOUS l'image et non dessus. Poser du texte sur une
 *     photo demande de mesurer les pixels a chaque image d'une video : la
 *     passe 6 refuse, et elle a raison.
 *
 * Sous `prefers-reduced-motion`, elle ne part jamais et l'affiche est tout ce
 * qu'il y a. Sans JavaScript, `poster` s'affiche : une balise `video` sans
 * `autoplay` montre son affiche, c'est le comportement natif.
 */

import { useRef, useState } from "react";

export default function FigureHover({
  src,
  poster,
  alt,
  caption,
}: {
  src: string;
  poster: string;
  alt: string;
  caption: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pinned, setPinned] = useState(false);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // play() est rejete si l'element est demonte pendant le geste : il n'y a
    // rien a rattraper, l'affiche reste.
    void videoRef.current?.play().catch(() => {});
    setPlaying(true);
  };

  const stop = () => {
    if (pinned) return;
    videoRef.current?.pause();
    setPlaying(false);
  };

  return (
    <figure className="group m-0">
      <div className="cut relative overflow-hidden bg-ink">
        <video
          ref={videoRef}
          className="aspect-3/4 w-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-label={alt}
          onPointerEnter={start}
          onPointerLeave={stop}
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Le bouton couvre l'image : il porte l'action, le focus clavier et
            le marqueur d'etat. Il n'est pas dans la coupe — `clip-path`
            rogne aussi l'anneau de focus — donc l'anneau est pose en
            `inset` plutot qu'en `offset`. */}
        <button
          type="button"
          aria-pressed={pinned}
          aria-label={
            pinned ? `Pause the clip: ${alt}` : `Play the clip: ${alt}`
          }
          onFocus={start}
          onBlur={stop}
          onClick={() => {
            if (pinned) {
              setPinned(false);
              videoRef.current?.pause();
              setPlaying(false);
            } else {
              setPinned(true);
              start();
            }
          }}
          className="absolute inset-0 flex items-start justify-end p-3 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-lime"
        >
          {/* Aplat d'encre sous le marqueur, jamais un degrade : le marqueur
              se pose sur une image dont on ne controle pas la luminosite. */}
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center bg-ink text-lime transition-colors duration-200 group-hover:bg-lime group-hover:text-ink"
          >
            {playing ? (
              <span className="flex gap-[3px]">
                <span className="block h-3.5 w-[2px] bg-current" />
                <span className="block h-3.5 w-[2px] bg-current" />
              </span>
            ) : (
              /* Le triangle reprend l'inclinaison du n plutot qu'une fleche
                 de lecteur generique. */
              <span className="ml-[2px] block size-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current" />
            )}
          </span>
        </button>
      </div>

      <figcaption className="label mt-s2 text-[color:var(--muted-foreground)]">
        {caption}
      </figcaption>
    </figure>
  );
}
