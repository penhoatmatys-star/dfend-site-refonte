"use client";

/* 21st.dev — « flow-field-background ».
 *
 * Des particules suivent un champ de vecteurs et laissent une trainee : le
 * canvas est estompe a chaque image plutot qu'efface, ce qui dessine les
 * traits. Le curseur les repousse.
 *
 * Porte tel quel depuis dfendinsurance.com, ou il porte deja le fond de la
 * section contact, lui-meme repris de dfendassociates. Les trois copies
 * doivent rester alignees : c'est le meme geste sur les trois sites du
 * groupe, et le client le demande ici pour cette raison.
 *
 * Ecarts a l'original, deja faits sur le site frere et conserves ici :
 * le vert de marque par defaut, la trainee estompee avec la nuit du site et
 * non un noir pur (l'original ecrivait rgba(0,0,0), qui grise sur une surface
 * non noire), `prefers-reduced-motion` respecte, et la boucle coupee hors
 * ecran.
 *
 * Un ecart de plus, propre a ce projet : la valeur du vert est lue sur le
 * document plutot qu'ecrite en dur. Le jeton `--color-lime` a bouge une fois
 * (#C7D65D vers #c6d75b) et une valeur en dur dans un canvas est exactement
 * ce qui ne suit pas.
 */

import { useEffect, useRef } from "react";

/* Constante de module : un tableau litteral par defaut aurait une identite
 * neuve a chaque rendu, relancerait l'effet et demonterait la boucle. */
const DEFAULT_FADE_RGB: [number, number, number] = [10, 10, 10];

export default function FlowFieldBackground({
  color,
  trailOpacity = 0.022,
  particleCount = 1400,
  speed = 1,
  dotSize = 2,
  fadeRgb = DEFAULT_FADE_RGB,
}: {
  color?: string;
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
  dotSize?: number;
  fadeRgb?: [number, number, number];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ink =
      color ??
      getComputedStyle(canvas).getPropertyValue("--color-lime").trim() ??
      "#c6d75b";

    let width = container.clientWidth;
    let height = container.clientHeight;
    let animationFrameId = 0;
    let isInView = true;
    const mouse = { x: -1000, y: -1000 };
    const [fr, fg, fb] = fadeRgb;

    class Particle {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      age = 0;
      life = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      update() {
        const angle =
          (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
        this.vx += Math.cos(angle) * 0.2 * speed;
        this.vy += Math.sin(angle) * 0.2 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const reach = 150;
        if (distance < reach) {
          const force = (reach - distance) / reach;
          this.vx -= dx * force * 0.05;
          this.vy -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.age++;
        if (this.age > this.life) this.reset();

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = ink;
        context.globalAlpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.fillRect(this.x, this.y, dotSize, dotSize);
      }
    }

    let particles: Particle[] = [];

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animate = () => {
      if (isInView) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${fr}, ${fg}, ${fb}, ${trailOpacity})`;
        ctx.fillRect(0, 0, width, height);
        for (const p of particles) {
          p.update();
          p.draw(ctx);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    animate();

    const io = new IntersectionObserver(([entry]) => {
      if (entry) isInView = entry.isIntersecting;
    });
    io.observe(container);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      io.disconnect();
      ro.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, trailOpacity, particleCount, speed, dotSize, fadeRgb]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
