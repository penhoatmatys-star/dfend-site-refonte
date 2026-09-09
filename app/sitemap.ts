import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

/* Le site tient sur une seule page : les onglets « about », « services »,
 * « testimonials » et « contact » sont des ancres de l'accueil, pas des URL.
 * Le plan ne porte donc que deux adresses.
 *
 * `/download` n'est pas un onglet — c'est un bouton — mais elle s'indexe :
 * les vingt-et-un PDF y sont, et c'est la page qu'un club cherche quand il
 * tape « dfend loss of value pdf ».
 *
 * `/legal` reste hors du plan : elle n'est pas publiable tant que la raison
 * sociale, l'IDE et le numero FINMA manquent (todo.md #9 et #10). L'indexer
 * serait republier une page a trous. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/download"];

  return routes.map((href) => ({
    url: SITE.domain + (href === "/" ? "" : href),
    lastModified: new Date("2026-09-09"),
    changeFrequency: "monthly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));
}
