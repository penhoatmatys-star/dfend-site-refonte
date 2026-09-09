"use client";

/* Les revelations au defilement.
 *
 * Un seul composant monte pour toute l'application : il balaie le document a
 * chaque changement de page et attache un tween par section. Les pages
 * restent des composants serveur et ne portent qu'un attribut `data-reveal`.
 *
 * Regle du projet : aucun etat initial n'est pose en CSS. Les opacites de
 * depart sont ecrites ici, juste avant de creer les tweens. Sans JavaScript,
 * la page est complete.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const sections = document.querySelectorAll<HTMLElement>("section, footer");

      sections.forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
        if (!items.length) return;
        // Une section deja visible au chargement n'est jamais masquee pour
        // etre revelee : la page s'afficherait, disparaitrait, puis
        // reviendrait. Le heros ne bouge donc pas.
        if (section.getBoundingClientRect().top < window.innerHeight * 0.85) return;

        gsap.set(items, { y: 24, opacity: 0 });
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform",
          scrollTrigger: { trigger: section, start: "top 85%", once: true },
        });
      });
    });

    /* Filet de securite. gsap anime au rythme des frames : un onglet ouvert
     * en arriere-plan n'en produit aucune, et ce qui est passe a l'opacite 0
     * y resterait. Deux secondes plus tard, on rend visible tout ce qui est a
     * l'ecran et encore transparent. gsap.set ecrit sans attendre de frame. */
    const watchdog = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const box = el.getBoundingClientRect();
        const onScreen = box.top < window.innerHeight && box.bottom > 0;
        if (onScreen && Number(getComputedStyle(el).opacity) < 1) {
          gsap.set(el, { clearProps: "all" });
        }
      });
    }, 2000);

    return () => {
      window.clearTimeout(watchdog);
      context.revert();
    };
  }, [pathname]);

  return null;
}
