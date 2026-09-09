import Link from "next/link";
import type { ComponentProps } from "react";

/* Le chevron reprend l'angle du n. C'est un des trois seuls usages de la
 * coupe, avec la separation de sol et le soulignement de l'onglet courant. */
export function BrandChevron() {
  return (
    <svg
      viewBox="0 0 15 13"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className="h-3 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
    >
      <path d="M0 6.5h13.4M8.2 1.3l5.2 5.2-5.2 5.2" />
    </svg>
  );
}

const BASE =
  "label group inline-flex min-h-11 items-center gap-3 px-5 py-3 transition-colors duration-200 active:translate-y-px";

/* Trois habillages, un par sol. Le bouton ne devine pas son fond : on le lui
 * dit, parce qu'un blanc pose sur le vert vaudrait 1.59:1. */
const SKIN = {
  ink: "bg-ink text-lime hover:bg-night focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
  ghost:
    "border border-ink text-ink hover:bg-ink hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
  onNight:
    "bg-lime text-ink hover:bg-chalk focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime",
  /* Le second bouton du heros. Le heros est passe de vert a video : `ghost`
     y aurait dessine un contour noir sur une image sombre, illisible. */
  onNightGhost:
    "border border-chalk text-chalk hover:bg-lime hover:text-ink hover:border-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime",
} as const;

/* Un `<button type="submit">` n'est pas un lien et ne peut pas passer par ce
 * composant. Il prend l'habillage par ici, pour que le bouton d'envoi du
 * formulaire soit exactement le meme objet que « enter & apply ». */
export function brandButtonClass(skin: keyof typeof SKIN = "ink") {
  return `${BASE} ${SKIN[skin]}`;
}

type Props = {
  href: string;
  skin?: keyof typeof SKIN;
  external?: boolean;
  children: React.ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children">;

export default function BrandButton({
  href,
  skin = "ink",
  external = false,
  children,
  className = "",
  ...rest
}: Props) {
  const cls = `${BASE} ${SKIN[skin]} ${className}`;

  if (external) {
    return (
      <a href={href} rel="noopener noreferrer external" className={cls} {...rest}>
        {children}
        <BrandChevron />
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      <BrandChevron />
    </Link>
  );
}
