/* 21st.dev — « testimonials-with-marquee », serafimcloud.
 *
 * Le defilement est une animation CSS pure : aucun JavaScript, donc les
 * cartes sont completes et lisibles sans lui, et le clavier n'a rien a
 * parcourir puisqu'aucune carte n'est cliquable.
 *
 * Quatre changements a l'original :
 *
 * 1. **Les deux voiles de bord en degrade sont retires.** Le projet n'a aucun
 *    degrade. Les cartes entrent et sortent franchement, comme la bande des
 *    implantations juste au-dessus, et le site n'a nulle part ailleurs de
 *    bord flou.
 * 2. `[--duration:40s]` sur une seule piste s'accelere des qu'on ajoute une
 *    carte. La duree est ici derivee du nombre de cartes, pour que la vitesse
 *    de defilement ne bouge pas quand le client en envoie une quatrieme.
 * 3. `prefers-reduced-motion` arrete la piste et la remet a zero. L'original
 *    laissait tourner. Une bande qui defile sans arret est exactement ce que
 *    ce reglage existe pour couper.
 * 4. Le titre et le chapeau sont rendus par la page et non par le composant :
 *    l'accueil a deja son etiquette et son `h2`, et un second jeu de titres
 *    aurait double la hierarchie.
 *
 * `aria-hidden` sur la copie : la piste est dupliquee pour que la boucle soit
 * continue, et un lecteur d'ecran ne doit entendre les trois avis qu'une
 * fois. La copie est decorative, l'originale porte le contenu.
 */

import { TestimonialCard, type TestimonialAuthor } from "./testimonial-card";

export type MarqueeTestimonial = {
  author: TestimonialAuthor;
  text: string;
  legalReview?: string;
};

/* Secondes par carte. Trois cartes font donc 36 s de tour complet, et la
 * vitesse reste la meme a quatre ou a six. */
const SECONDS_PER_CARD = 12;

export function TestimonialsMarquee({
  testimonials,
  label,
}: {
  testimonials: readonly MarqueeTestimonial[];
  label: string;
}) {
  const duration = `${testimonials.length * SECONDS_PER_CARD}s`;

  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden">
      <div
        className="group flex flex-row gap-s3 py-2 [--gap:var(--spacing-s3)]"
        style={{ ["--duration" as string]: duration }}
      >
        {[0, 1].map((track) => (
          <ul
            key={track}
            aria-label={track === 0 ? label : undefined}
            aria-hidden={track === 1 ? "true" : undefined}
            /* La piste se met en pause au survol : une citation de trois
               lignes ne se lit pas en mouvement. */
            className="animate-marquee m-0 flex shrink-0 list-none flex-row gap-s3 p-0 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          >
            {testimonials.map((item) => (
              <li key={item.author.name} className="flex">
                <TestimonialCard {...item} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
