import Image from "next/image";

/* La photo, noir et blanc documentaire, coupee a 41 degres.
 *
 * La coupe va sur les images et jamais sur un element focusable : clip-path
 * rogne aussi l'anneau de focus.
 */

type Photo = {
  src: string;
  small: string;
  alt: string;
  caption: string;
};

export default function FigureBw({
  photo,
  sizes = "(min-width: 860px) 46vw, 100vw",
  priority = false,
}: {
  photo: Photo;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className="m-0">
      <div className="cut relative overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={960}
          height={640}
          sizes={sizes}
          priority={priority}
          className="h-auto w-full grayscale"
        />
      </div>
      <figcaption className="label mt-s2 text-[color:var(--muted-foreground)]">
        {photo.caption}
      </figcaption>
    </figure>
  );
}
