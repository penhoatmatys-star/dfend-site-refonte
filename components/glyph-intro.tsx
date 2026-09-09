"use client";

/* L'ouverture du site : le n du mot-symbole, en volume, sur le sol vert.
 *
 * Elle joue une fois par session, elle se coupe au premier geste, et elle ne
 * se voit jamais sous `prefers-reduced-motion`, sans WebGL, ou sans
 * JavaScript. Le rideau se retire sur l'entaille a 41 degres : c'est le seul
 * angle du site, et c'est lui qui decouvre la page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GlyphScene } from "@/lib/glyph-scene";
import { INTRO_PENDING, markIntroPlayed } from "@/lib/intro";

/* La pente de la coupe : sur une largeur de 100vw, l'arete monte de
 * tan(41 degres) = 0.8693. Le rideau est d'autant plus haut. */
const CUT_RISE = "86.93vw";

export default function GlyphIntro() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  /* La decision d'ouvrir est deja prise par `intro-mount` : si ce composant
   * est monte, l'intro joue. `play` ne sert plus qu'a le demonter a la fin. */
  const [play, setPlay] = useState(true);

  /** Retire le rideau et rend la main a la page, quoi qu'il arrive. */
  const finish = useCallback(() => {
    document.documentElement.classList.remove(INTRO_PENDING);
    markIntroPlayed();
    setPlay(false);
  }, []);

  useEffect(() => {
    if (!play) return;

    const canvas = canvasRef.current;
    const sheet = sheetRef.current;
    const root = rootRef.current;
    const skip_ = skipRef.current;
    if (!canvas || !sheet || !root) return;

    let scene: GlyphScene;
    try {
      scene = new GlyphScene({ canvas });
    } catch {
      // Contexte refuse au dernier moment : on ne bloque pas le site pour ca.
      finish();
      return;
    }

    const fit = () => {
      scene.resize(root.clientWidth, root.clientHeight);
      scene.render();
    };
    fit();

    // Etat de depart pose ici, jamais en CSS. La lettre arrive de trois
    // quarts dos, legerement trop grande, et se presente de face.
    const pose = { yaw: -1.35, pitch: 0.22, scale: 1.24, fade: 1 };
    const draw = () => {
      scene.setRotation(pose.yaw, pose.pitch);
      scene.setScale(pose.scale);
      canvas.style.opacity = String(pose.fade);
      scene.render();
    };
    draw();

    const timeline = gsap.timeline({ onUpdate: draw, onComplete: finish });
    timelineRef.current = timeline;

    timeline
      .to(pose, { yaw: 0, duration: 1.15, ease: "power3.out" }, 0)
      .to(pose, { pitch: 0, duration: 1.3, ease: "power2.out" }, 0)
      .to(pose, { scale: 1, duration: 1.3, ease: "power2.out" }, 0)
      // Le rideau part avant que la lettre ne soit tout a fait posee : la
      // page se decouvre pendant le dernier quart de tour, pas apres.
      .add(() => {
        document.documentElement.classList.remove(INTRO_PENDING);
      }, 0.95)
      .to(pose, { fade: 0, duration: 0.35, ease: "power2.in" }, 0.95)
      // Le bouton part avec la lettre. Le laisser vivre jusqu'a la fin de la
      // timeline le poserait trois quarts de seconde sur une page deja
      // rendue, ou il ne veut plus rien dire.
      .to(skip_, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0.95)
      .to(
        sheet,
        {
          yPercent: -100,
          duration: 0.75,
          ease: "power3.inOut",
          force3D: true,
        },
        0.95,
      );

    /* Coupure au premier geste. On ne coupe pas net : on accelere jusqu'au
     * retrait du rideau, sinon la page saute. */
    const skip = () => {
      if (timeline.time() < 0.95) timeline.seek(0.95);
      timeline.timeScale(2.6);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };

    root.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("resize", fit);

    return () => {
      root.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("resize", fit);
      timeline.kill();
      timelineRef.current = null;
      scene.dispose();
    };
  }, [play, finish]);

  if (!play) return null;

  return (
    <div
      ref={rootRef}
      id="intro"
      className="fixed inset-0 z-100 overflow-hidden"
      style={{ contain: "strict" }}
    >
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 bg-lime"
        style={{
          height: `calc(100% + ${CUT_RISE})`,
          clipPath: `polygon(0 ${CUT_RISE}, 100% 0, 100% 100%, 0 100%)`,
          willChange: "transform",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      <button
        ref={skipRef}
        type="button"
        onClick={() => timelineRef.current?.seek(0.95).timeScale(2.6)}
        className="label absolute top-(--edge) right-(--edge) z-10 inline-flex min-h-11 cursor-pointer items-center border border-ink px-4 text-ink transition-colors duration-200 hover:bg-ink hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
      >
        skip intro
      </button>
    </div>
  );
}
