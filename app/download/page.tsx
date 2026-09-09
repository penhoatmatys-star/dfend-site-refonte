import type { Metadata } from "next";
import DownloadMark from "@/components/download-mark";
import { DOCUMENTS, DOWNLOAD_PAGE, LANG_NAMES } from "@/lib/documents";
import { SITE } from "@/lib/content";
import BrandButton from "@/components/brand-button";

export const metadata: Metadata = {
  title: "download",
  description:
    "The dfend documents in PDF: check-in, 3A ProSport, Index Universal Life, Loss of Value protection and Fortiva Pro, in English, Italian, German, French and Spanish.",
};

/* La page de telechargement.
 *
 * L'original Wix est une grille : les documents en colonnes, les langues en
 * lignes, et vingt-et-une vignettes GIF identiques comme seul repere. Une
 * grille a deux entrees se lit mal des qu'elle passe sous 860 px, et sur
 * telephone Wix la replie en une colonne de vingt-et-un liens sans titre.
 *
 * Elle est retournee ici : un document par bloc, ses langues en rang. C'est
 * la meme information, dans l'ordre ou on la cherche — on vient chercher
 * « Loss of Value », puis on choisit sa langue, jamais l'inverse.
 *
 * Chaque lien annonce ce qu'il ouvre avant qu'on clique : la langue en toutes
 * lettres, le nombre de pages, le poids du fichier. Un lien de telechargement
 * qui ne dit pas qu'il pese 5,2 Mo est un piege sur un forfait mobile.
 *
 * `download` sur le lien, et les PDF sont servis depuis le domaine : plus
 * aucun appel a Wix quand le site partira en ligne.
 */
export default function Download() {
  const total = DOCUMENTS.reduce((n, d) => n + d.files.length, 0);

  return (
    <>
      <section className="on-night bg-night py-[clamp(56px,8vw,104px)] text-chalk">
        <div className="wrap">
          <p className="label text-lime">{DOWNLOAD_PAGE.eyebrow}</p>
          <h1 className="mt-s3">{DOWNLOAD_PAGE.heading}</h1>
          <p className="lede mt-s4">{DOWNLOAD_PAGE.lede}</p>
        </div>
      </section>

      <section className="ground">
        <div className="wrap">
          <p className="label" data-reveal>
            {DOCUMENTS.length} documents &middot; {total} files
          </p>

          <ul className="mt-s5 m-0 list-none border-t border-rule-ink p-0">
            {DOCUMENTS.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-1 gap-s3 border-b border-rule-ink py-s4 md:grid-cols-12 md:gap-s4"
                data-reveal
              >
                <div className="md:col-span-5">
                  <h2 className="text-xl">{entry.title}</h2>
                  <p className="mt-s2 text-sm text-ink-soft">{entry.line}</p>
                  <p className="label mt-s2 text-ink-soft">
                    pdf &middot; {entry.pages} {entry.pages === 1 ? "page" : "pages"}
                  </p>
                </div>

                <div className="md:col-span-7">
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {entry.files.map((file) => (
                      <li key={file.lang}>
                        {/* `download` demande l'enregistrement plutot que la
                            visionneuse integree : on vient ici pour garder le
                            document, pas pour le feuilleter. Le nom du fichier
                            servi est deja explicite, donc l'attribut reste
                            vide et le navigateur le reprend tel quel. */}
                        <a
                          href={file.href}
                          download
                          aria-label={`${entry.title}, ${LANG_NAMES[file.lang]}, PDF, ${file.mb} MB`}
                          className="group flex min-h-11 flex-col justify-center border border-rule-ink px-4 py-2 transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
                        >
                          <span className="label flex items-center gap-3">
                            {LANG_NAMES[file.lang]}
                            <DownloadMark className="ml-auto" />
                          </span>
                          <span className="label mt-1 opacity-60">
                            {file.mb} mb
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="on-lime ground">
        <div className="wrap grid grid-cols-1 gap-s4 md:grid-cols-12">
          <div className="md:col-span-7" data-reveal>
            <p className="label">not what you were looking for</p>
            <h2 className="mt-s2">Ask us for the file.</h2>
            <p className="mt-s3">
              Write to the Lugano office and we send the document you need.
            </p>
          </div>
          <div className="flex items-end md:col-span-4 md:col-start-9" data-reveal>
            <BrandButton href={`mailto:${SITE.email}`} skin="ghost" external>
              {SITE.email}
            </BrandButton>
          </div>
        </div>
      </section>
    </>
  );
}
