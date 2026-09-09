"use client";

/* La charniere : le meme n en volume, au milieu de la page, pilote au scroll.
 *
 * C'est la seule respiration du site. La lettre fait un demi-tour pendant
 * qu'on la traverse, l'entaille passe de profil au point mort, et le sol vert
 * se coupe a 41 degres sur la nuit qui suit. Pas de texte : le mot-symbole
 * est deja le sujet, lui ajouter une phrase serait une affirmation de plus.
 *
 * La scene WebGL n'est construite qu'a l'approche de l'ecran. Sous
 * `prefers-reduced-motion` ou sans WebGL, on sert le glyphe a plat : meme
 * dessin, meme place, aucun contexte graphique ouvert.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { hasWebGL } from "@/lib/webgl";
import type { GlyphScene } from "@/lib/glyph-scene";

/* Un quart de tour de chaque cote du point mort : assez pour que l'entaille
 * se lise en volume, pas assez pour que la lettre devienne illisible. */
const YAW = 0.62;

export default function GlyphHinge() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);
  const [animated, setAnimated] = useState(false);

  /* `animated` part a faux, et il part a faux des deux cotes.
   *
   * Decider dans l'initialisateur de useState, en lisant `window`, donne un
   * rendu serveur (le glyphe a plat) et un premier rendu client (le canvas)
   * qui ne coincident pas : React jette l'arbre et rejoue tout, en signalant
   * une erreur d'hydratation. Le serveur sert donc le repli, et on ne bascule
   * qu'une fois monte. Sans JavaScript, le repli reste, ce qui est
   * exactement ce qu'on veut.
   *
   * Sous mouvement reduit, on ne construit rien du tout. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!hasWebGL()) return;
    setAnimated(true);
  }, []);

  /* Ensuite : ne reveiller la scene qu'a une hauteur d'ecran de distance.
   * Ouvrir un contexte WebGL pour une section qu'on ne verra peut-etre
   * jamais est un cout net. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!animated || !section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [animated]);

  /* Seconde etape : la scene et son attache au scroll.
   *
   * C'est ici, et pas plus tot, que three.js est reellement telecharge. Un
   * import statique le ferait partir avec la page pour une section qu'on ne
   * verra peut-etre jamais. */
  useEffect(() => {
    if (!live) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    (async () => {
      const { GlyphScene } = await import("@/lib/glyph-scene");
      if (cancelled || !canvasRef.current) return;

      let scene: GlyphScene;
      try {
        scene = new GlyphScene({ canvas });
      } catch {
        setLive(false);
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const fit = () => {
        scene.resize(canvas.clientWidth, canvas.clientHeight);
        scene.render();
      };
      fit();

      const pose = { yaw: -YAW };
      const draw = () => {
        scene.setRotation(pose.yaw, pose.yaw * 0.12);
        scene.render();
      };
      draw();

      const tween = gsap.to(pose, {
        yaw: YAW,
        ease: "none",
        onUpdate: draw,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          // Le scrub lisse la rotation sans la desynchroniser du doigt.
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      const observer = new ResizeObserver(fit);
      observer.observe(canvas);

      teardown = () => {
        observer.disconnect();
        tween.scrollTrigger?.kill();
        tween.kill();
        scene.dispose();
      };
      // Demonte entre-temps : on nettoie tout de suite.
      if (cancelled) teardown();
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [live]);

  return (
    /* Le sol nuit est pose dessous : la coupe a 41 degres ne decouvre pas le
       fond de page, elle decouvre la section suivante. C'est ce qui en fait
       une transition entre deux sols plutot qu'un coin rogne. */
    <div className="bg-night">
      <section
        ref={sectionRef}
        aria-hidden="true"
        className="on-lime cut-band relative bg-lime"
        style={{ height: "clamp(380px, 66vh, 660px)" }}
      >
        {animated ? (
          <canvas ref={canvasRef} className="h-full w-full" />
        ) : (
          /* Repli : le glyphe a plat, meme cadrage. Aucun contexte graphique. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/img/glyph-n.svg"
            alt=""
            className="absolute top-1/2 left-1/2 h-[46%] w-auto -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </section>
    </div>
  );
}
