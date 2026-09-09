"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DownloadMark from "@/components/download-mark";
import { NAV } from "@/lib/content";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Le panneau deroulant n'existe qu'en dessous de 860px. En repassant
  // au-dessus il faut le refermer, sinon aria-expanded ment.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 860px)");
    const close = () => setOpen(false);
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="on-night sticky top-0 z-40 border-b border-rule-chalk bg-night text-chalk">
      <div className="wrap flex min-h-[68px] flex-wrap items-center justify-between gap-s3">
        <Link
          href="/"
          aria-label="dfend group, home"
          className="inline-flex min-h-11 items-center focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
        >
          {/* Le mot-symbole « dfend group », detoure du carre 1600x1600 fourni
              par le client : l'alpha vient de la darkness du trace, pas d'un
              seuil binaire, donc l'antialiasing d'origine est conserve.

              A la demande du client, il reprend le carre tel quel : plaque
              verte, mot-symbole noir. Le verrou blanc de public/img sert de
              masque, le sol vient du jeton `--color-lime` et le trace du jeton
              `--color-ink` — un seul PNG pour les deux, et le jour ou l'un des
              deux tons bouge le logo suit sans qu'on regenere quoi que ce
              soit. Rayon zero, comme tout le reste.

              Le mot-symbole est deja porte par l'`aria-label` du lien : la
              plaque masquee est decorative et ne redit rien. */}
          <span
            aria-hidden="true"
            className="inline-flex bg-lime px-3 py-2"
          >
            <span
              className="block aspect-[632/113] w-[clamp(120px,15vw,150px)] bg-ink"
              style={{
                maskImage: "url(/img/logo-dfend-group-white.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/img/logo-dfend-group-white.png)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            />
          </span>
        </Link>

        {/* Le coin haut-droit. Sur telephone il porte le telechargement et le
            menu cote a cote ; le panneau deroulant passe dessous en pleine
            largeur. Sur ordinateur, `order` remet le bouton apres la
            navigation : « en haut a droite » veut dire le dernier element de
            la ligne, pas le troisieme sur quatre. */}
        <div className="flex items-center gap-s2 min-[860px]:order-3">
          {/* En dessous de 480 px le mot tombe et il ne reste que la fleche.
              Additionnes, le verrou (132 px), « download » et « menu »
              debordaient les 335 px utiles d'un telephone de 375 : l'en-tete
              passait sur deux lignes, et il est colle en haut de chaque page.
              Le nom accessible est porte par `aria-label`, donc il ne
              disparait pas avec le mot. */}
          <Link
            href="/download"
            aria-label="downloads"
            aria-current={pathname === "/download" ? "page" : undefined}
            onClick={() => setOpen(false)}
            className="label group inline-flex min-h-11 items-center gap-2 bg-lime px-4 text-ink transition-colors duration-200 hover:bg-chalk focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
          >
            <span aria-hidden="true" className="hidden min-[480px]:inline">
              download
            </span>
            <DownloadMark />
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen((v) => !v)}
            className="label min-h-11 cursor-pointer border border-rule-chalk px-4 text-chalk transition-colors duration-200 hover:border-lime hover:bg-lime hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime min-[860px]:hidden"
          >
            menu
          </button>
        </div>

        <nav
          id="nav"
          aria-label="Main"
          data-open={open}
          className="hidden basis-full data-[open=true]:block min-[860px]:order-2 min-[860px]:block min-[860px]:basis-auto"
        >
          <ul className="flex flex-col gap-0.5 border-t border-rule-chalk pt-s2 pb-s3 min-[860px]:flex-row min-[860px]:gap-s3 min-[860px]:border-0 min-[860px]:p-0">
            {NAV.map((item) => {
              const current = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="label relative block min-h-11 px-1 leading-[44px] transition-colors duration-200 hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-lime"
                  >
                    {item.label}
                    {/* Le soulignement de l'onglet courant reprend l'angle du
                        n : c'est un des trois seuls usages de la coupe. */}
                    {current ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-1.5 left-1 h-[3px] w-[22px] bg-lime"
                        style={{ transform: "skewX(-49deg)" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
