"use client";

/* La methode en trois temps, en rail de progression.
 *
 * Trois phases dans l'ordre : analyze, design, monitor. Chacune porte son
 * numero et son intitule, rien de plus — la liste des six prestations qui
 * vivait sous « design » a ete retiree a la demande du client le 2026-09-09.
 * Les six lignes restent servies plus bas, dans le carrousel « our services ».
 * Les numeros 01–03 tiennent parce que l'ordre dit quelque chose : on analyse
 * avant de concevoir, on concoit avant de suivre.
 *
 * La forme vient du site frere dfendinsurance.com (« Scroll Reveal Content A »
 * de 21st.dev, retravaille) : un index colle a gauche qui porte 01–03 et les
 * trois noms, une echine d'un pixel qui se remplit a mesure qu'on descend —
 * la methode avance litteralement — et les trois etapes en flux normal a
 * droite. En dessous de 1024 px l'index se replie en frise verticale le long
 * des etapes : rien n'est epingle, c'est une colonne.
 *
 * `active` vient d'un seul IntersectionObserver avec une bande mince au
 * milieu de l'ecran. Le remplissage et le numero allume en derivent tous les
 * deux, et passent d'un cran a l'autre par une transition CSS : une methode
 * avance par etats discrets, un remplissage au cran n'a besoin d'aucun
 * ecouteur de defilement. Si l'observateur ne se declenche jamais, l'etape 01
 * reste allumee, ce qui est un etat de repos correct.
 *
 * Sans JavaScript, les trois etapes sont la, dans l'ordre, echine grise et
 * numeros eteints. Rien n'est masque en CSS.
 */

import { useEffect, useRef, useState } from "react";
import { METHOD } from "@/lib/content";

const NAMES = ["analyze", "design", "monitor"] as const;

export default function MethodRail() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  };

  // 1/3 -> 1. L'echine est une barre pleine hauteur mise a l'echelle par le
  // haut, donc une seule transformation animee et aucune reflow.
  const fill = (active + 1) / METHOD.length;

  return (
    <div className="mt-s5 grid gap-y-s5 lg:grid-cols-12 lg:gap-x-s5">
      {/* L'index colle, a partir de 1024px seulement. */}
      <div className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-[104px]">
          <p className="label text-[color:var(--muted-foreground)]">
            the method
          </p>

          <ol className="relative mt-s3 list-none p-0 pl-6">
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-0 w-px bg-[color:var(--border)]"
            />
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-0 w-px origin-top bg-[color:var(--foreground)] transition-transform duration-700 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleY(${fill})` }}
            />

            {METHOD.map((phase, index) => {
              const reached = index <= active;
              const current = index === active;
              return (
                <li key={phase.key} className="relative -ml-6 flex items-center">
                  <span
                    aria-hidden="true"
                    className={`ml-[-3.5px] h-[7px] w-[7px] shrink-0 border transition-colors duration-500 motion-reduce:transition-none ${
                      reached
                        ? "border-[color:var(--foreground)] bg-[color:var(--foreground)]"
                        : "border-[color:var(--border)] bg-transparent"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={current ? "step" : undefined}
                    className="group ml-4 flex min-h-11 items-baseline gap-3 text-left focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--ring)]"
                  >
                    <span
                      className={`font-sans text-lg tabular-nums [font-variation-settings:'wdth'_75,'wght'_800] transition-opacity duration-500 motion-reduce:transition-none ${
                        current ? "opacity-100" : reached ? "opacity-70" : "opacity-35"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`label transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none ${
                        current ? "opacity-100" : "opacity-45"
                      }`}
                    >
                      {NAMES[index]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Les trois etapes. */}
      <div className="lg:col-span-7 lg:col-start-6">
        <div className="relative">
          {/* Frise mobile, sur toute la hauteur de la liste. */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-px bg-[color:var(--border)] lg:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-px origin-top bg-[color:var(--foreground)] transition-transform duration-700 ease-out motion-reduce:transition-none lg:hidden"
            style={{ transform: `scaleY(${fill})` }}
          />

          <div className="flex flex-col gap-s6 pl-8 lg:pl-0">
            {METHOD.map((phase, index) => (
              <article
                key={phase.key}
                data-index={index}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                className="relative scroll-mt-[120px]"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-2 -left-8 h-[9px] w-[9px] border transition-colors duration-500 motion-reduce:transition-none lg:hidden ${
                    index <= active
                      ? "border-[color:var(--foreground)] bg-[color:var(--foreground)]"
                      : "border-[color:var(--border)] bg-transparent"
                  }`}
                />

                <p className="font-sans text-3xl leading-none tabular-nums [font-variation-settings:'wdth'_75,'wght'_800]">
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className="mt-s3 text-2xl">{phase.head}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
