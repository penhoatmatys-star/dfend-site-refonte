"use client";

/* 21st.dev — « Button Magnetic », uilayout.contact.
 * https://21st.dev/@uilayout.contact/components/button-magnetic
 *
 * L'original est un bouton vert code en dur. Ici il devient une enveloppe :
 * il ne peint rien, il ne fait que deplacer ce qu'on lui donne. Le bouton
 * garde donc son habillage de marque et ses trois etats.
 *
 * Quatre ajouts a l'original, tous du meme ordre :
 *   — `prefers-reduced-motion: reduce` coupe l'effet. L'original bougeait
 *     quand meme ;
 *   — un pointeur grossier (tactile) le coupe aussi : sans survol, l'ecouteur
 *     `mousemove` global ne sert qu'a consommer de la batterie ;
 *   — l'ecouteur est passif et lit `clientX/clientY` et non `pageX/pageY` :
 *     `getBoundingClientRect` est deja relatif au viewport, l'original
 *     melangeait les deux reperes et le bouton derivait des qu'on avait
 *     defile ;
 *   — il ne s'attache qu'une fois la cible dans l'ecran, et se detache quand
 *     elle en sort.
 *
 * Le mouvement reste dans `transform` et rien d'autre, comme le reste du
 * site.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const RANGE = 110; // px : au-dela, le bouton ne sent plus le curseur
const PULL = 0.32; // fraction de la distance reellement parcourue

export default function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const [live, setLive] = useState(false);

  // Comme partout dans le projet : la decision se prend dans un effet, jamais
  // dans l'initialisateur d'un useState. Le rendu serveur et le premier rendu
  // client servent donc la meme chose.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const decide = () => setLive(fine.matches && !still.matches);
    decide();
    still.addEventListener("change", decide);
    fine.addEventListener("change", decide);
    return () => {
      still.removeEventListener("change", decide);
      fine.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!live || !el) return;

    let attached = false;
    const onMove = (e: MouseEvent) => {
      const box = el.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance < RANGE) {
        const strength = 1 - distance / RANGE;
        x.set(dx * strength * PULL);
        y.set(dy * strength * PULL);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const attach = (on: boolean) => {
      if (on === attached) return;
      attached = on;
      if (on) window.addEventListener("mousemove", onMove, { passive: true });
      else {
        window.removeEventListener("mousemove", onMove);
        x.set(0);
        y.set(0);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => attach(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: "120px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      attach(false);
    };
  }, [live, x, y]);

  if (!live) return <span ref={ref}>{children}</span>;

  return (
    <motion.span ref={ref} style={{ x: springX, y: springY }} className="inline-block">
      {children}
    </motion.span>
  );
}
