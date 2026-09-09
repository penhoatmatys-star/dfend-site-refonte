/* 21st.dev — « testimonial-card », serafimcloud.
 * Dependance du carrousel `testimonials-with-marquee`.
 *
 * Trois changements a l'original, et le premier n'est pas negociable :
 *
 * 1. **L'avatar est retire.** L'original ouvre chaque carte sur une photo
 *    ronde, et sa notice d'integration dit de remplir les images manquantes
 *    avec des photos Unsplash. Coller le visage d'un inconnu a cote de
 *    « Morgan Poaty, FC Lausanne-Sport » fabriquerait le portrait d'une
 *    personne reelle et nommee. C'est un faux temoignage en image, la chose
 *    meme que ce projet refuse. La carte porte donc les initiales, tracees.
 * 2. `rounded-lg` et `rounded-full` retires : le seul rayon de coin du site
 *    est zero, et ca vaut aussi pour la pastille d'initiales.
 * 3. Le fond en degrade `from-muted/50 to-muted/10` devient un aplat. Le
 *    projet n'a aucun degrade, et un degrade sur le vert de marque aurait
 *    fabrique une quatrieme surface entre les trois sols.
 *
 * Le `handle` de l'original devient l'affiliation : un club, pas un compte.
 */

export type TestimonialAuthor = {
  name: string;
  affiliation: string;
};

/* Deux initiales, prises sur le prenom et le nom. Un nom en un seul mot rend
 * une seule lettre plutot qu'une lettre doublee. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialCard({
  author,
  text,
  legalReview,
}: {
  author: TestimonialAuthor;
  text: string;
  legalReview?: string;
}) {
  return (
    <figure
      data-legal-review={legalReview}
      className="flex w-[19rem] shrink-0 flex-col justify-between border border-[color:var(--border)] bg-[color:var(--card)] p-6 sm:w-[23rem] sm:p-7"
    >
      <blockquote className="text-sm leading-[1.6]">
        <q className="[quotes:none]">{text}</q>
      </blockquote>

      <figcaption className="mt-s4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="label flex size-10 shrink-0 items-center justify-center border border-[color:var(--border)] text-[color:var(--foreground)]"
        >
          {initials(author.name)}
        </span>
        <span className="min-w-0">
          <cite className="label block not-italic">{author.name}</cite>
          <span className="mt-1 block text-xs text-[color:var(--muted-foreground)]">
            {author.affiliation}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
