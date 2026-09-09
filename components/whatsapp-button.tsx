/* Le bouton WhatsApp, en bas a droite de chaque page.
 *
 * Le numero est celui qu'imprime chaque PDF du client, sous « Andrea
 * Albertoni », au-dessus de `www.dfend.swiss` : vingt-et-un documents
 * telecharges le 2026-09-08 le portent, tous identiques. Il n'est plus un
 * contact de groupe non confirme et la question 40 de tasks/todo.md est close.
 *
 * **Une pastille, pas un chiffre.** Le site actuel affiche un « 1 » sur cette
 * bulle. Un compteur de messages non lus sur un bouton qui n'a jamais recu de
 * message est un chiffre invente, et c'est la regle du projet : rien ne
 * s'affiche que le client ne puisse montrer. La pastille dit que le canal est
 * ouvert, elle ne pretend pas qu'on vous a ecrit. Elle bat, et
 * `prefers-reduced-motion` l'arrete comme le reste du site.
 *
 * Carre, vert de marque, glyphe a l'encre : la bulle ronde et le vert
 * WhatsApp auraient introduit le seul rayon non nul et la seule couleur hors
 * charte de tout le site. Le glyphe suffit a le faire reconnaitre.
 *
 * Il est enfant direct du `body`, donc le rideau d'ouverture le masque avec le
 * reste — `body > *:not(#intro)`.
 */

import PhoneIcon from "@/components/ui/phone-icon";
import { SITE } from "@/lib/content";

export default function WhatsAppButton() {
  return (
    <a
      href={SITE.whatsapp}
      rel="noopener noreferrer external"
      aria-label={`Message dfend on WhatsApp, ${SITE.phone}`}
      className="group fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-30 inline-flex h-14 w-14 items-center justify-center bg-lime text-ink shadow-[0_2px_24px_oklch(0%_0_0_/_0.35)] transition-colors duration-200 hover:bg-chalk focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
    >
      {/* Le combine au trait, demande par le client, a la place du glyphe
          plein de WhatsApp. Il se dessine une fois au montage.
          A signaler : un combine sur un bouton flottant se lit d'ordinaire
          « appelez-nous », la ou le glyphe de WhatsApp se reconnait sans
          legende. Le nom accessible dit WhatsApp, mais il n'est lu que par
          ceux qui l'entendent. Voir tasks/todo.md #48. */}
      <PhoneIcon size={28} aria-hidden="true" />

      {/* La pastille. Deux carres superposes : l'un bat, l'autre reste, sinon
          la marque disparait entre deux pulsations.
          A l'encre, cerclee de vert. Elle deborde du bouton, donc elle se
          retrouve tantot sur le papier, tantot sur la nuit : l'encre porte sur
          le papier, le cercle vert porte sur la nuit, et elle tient sur les
          deux sans qu'on ait a savoir sur quoi la page l'a posee. */}
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5"
      >
        <span className="absolute inline-flex h-full w-full animate-ping bg-ink opacity-60" />
        <span className="relative inline-flex h-3.5 w-3.5 border-2 border-lime bg-ink" />
      </span>
    </a>
  );
}
