/* Le catalogue de /download.
 *
 * Il reproduit la page `dfend.swiss/download` relevee le 2026-09-08 : cinq
 * documents, quatre langues chacun, cinq pour Fortiva Pro. Les vingt-et-un
 * PDF ont ete telecharges depuis `www.dfend.swiss/_files/ugd/57fd4b_*.pdf` et
 * sont servis depuis `public/documents/`. Le site ne renvoie plus sur Wix :
 * la refonte doit pouvoir partir en ligne sans que l'ancien hebergeur
 * continue de servir les pieces jointes.
 *
 * REGLE DU PROJET, APPLIQUEE ICI AUSSI : rien n'est invente.
 *
 * — `title` est l'intitule du document tel qu'il est imprime sur sa propre
 *   couverture, et non l'etiquette abregee de la grille Wix. « CHECK IN/OUT »
 *   devient « Check-in », le titre que porte le PDF.
 * — `line` est une phrase du document lui-meme, recopiee de la version
 *   anglaise. Aucune n'est ecrite pour l'occasion.
 * — `pages` et `mb` sont mesures sur les fichiers (`pdfinfo`, `stat`). Un
 *   poids annonce avant le clic est une information, pas une promesse.
 *
 * Ce qui n'est PAS repris de la page Wix : la cellule « Titolo 5 », un titre
 * par defaut reste en place au-dessus de la colonne « Loss of value ». C'est
 * exactement le genre de chaine que refuse la passe 11.
 *
 * L'ordre est celui de la grille d'origine, de gauche a droite.
 */

export type DocLang = "en" | "it" | "de" | "fr" | "es";

export const LANG_NAMES: Record<DocLang, string> = {
  en: "English",
  it: "Italiano",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export type DocFile = {
  lang: DocLang;
  href: string;
  mb: string;
};

export type DocEntry = {
  id: string;
  title: string;
  line: string;
  pages: number;
  files: DocFile[];
};

const doc = (
  id: string,
  title: string,
  line: string,
  pages: number,
  files: [DocLang, string][],
): DocEntry => ({
  id,
  title,
  line,
  pages,
  files: files.map(([lang, mb]) => ({
    lang,
    href: `/documents/dfend-${id}-${lang}.pdf`,
    mb,
  })),
});

export const DOCUMENTS: readonly DocEntry[] = [
  doc(
    "check-in-out",
    "Check-in",
    "Your arrival in Switzerland.",
    2,
    [
      ["en", "5.1"],
      ["it", "5.2"],
      ["de", "5.2"],
      ["fr", "5.2"],
    ],
  ),
  doc(
    "3a-prosport",
    "3A ProSport",
    "Insurance and tax savings. Always in the game, even tomorrow.",
    2,
    [
      ["en", "1.2"],
      ["it", "1.2"],
      ["de", "1.2"],
      ["fr", "1.2"],
    ],
  ),
  doc(
    "index-universal-life",
    "Index Universal Life",
    "Smart protection for those who live at the top.",
    2,
    [
      ["en", "4.0"],
      ["it", "4.0"],
      ["de", "4.0"],
      ["fr", "4.0"],
    ],
  ),
  doc(
    "loss-of-value",
    "Loss of Value protection",
    "Protect the value. Safeguard every stakeholder. Ensure the transfer.",
    1,
    [
      ["en", "0.7"],
      ["it", "0.7"],
      ["de", "0.7"],
      ["fr", "0.7"],
    ],
  ),
  doc(
    "fortiva-pro",
    "Fortiva Pro",
    "Lifestyle protection and risk mitigation, for athletes and performers.",
    1,
    [
      ["en", "2.0"],
      ["it", "2.0"],
      ["de", "2.0"],
      ["fr", "2.0"],
      ["es", "2.0"],
    ],
  ),
] as const;

/* L'en-tete de la page.
 *
 * L'original dit « All what you need. » et « You can download here all the
 * important stuff and informations. » Les deux phrases sont fautives en
 * anglais — accord, article manquant, « informations » indenombrable — et le
 * client vend a des clubs et a des agents anglophones. Le sens est garde mot
 * pour mot, la grammaire est corrigee. Signale en question dans
 * tasks/todo.md : un mot du client et la formulation d'origine revient. */
export const DOWNLOAD_PAGE = {
  eyebrow: "downloads",
  heading: "Everything you need.",
  lede: "Every solution, in every language we publish it in. Each file is a PDF.",
} as const;
