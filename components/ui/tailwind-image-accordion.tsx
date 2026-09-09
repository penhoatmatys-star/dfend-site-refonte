/* 21st.dev — « Tailwind Image Accordion », uilayout.contact.
 * https://21st.dev/@uilayout.contact/components/tailwind-image-accordion
 *
 * Retenu pour une raison : il n'a pas une ligne de JavaScript. L'ouverture
 * tient dans `group-hover`, donc sans JavaScript les six panneaux restent a
 * egalite, ouverts et lisibles. C'est la regle du projet.
 *
 * Quatre choses ont ete changees a l'original :
 *   — `rounded-xl` retire : le seul rayon de coin du site est zero ;
 *   — le degrade `before` derriere la legende devient un aplat d'encre. Le
 *     projet n'a aucun degrade, et une legende posee sur un degrade a 50%
 *     au-dessus d'une photo claire — la pile de papier — descendait sous
 *     3:1. Un aplat se mesure, un degrade se devine ;
 *   — la legende ne s'affiche plus au survol : elle est la tout le temps, et
 *     elle passe a la ligne. L'original masquait le titre hors survol, ce qui
 *     revient a cacher le nom d'une prestation a qui n'a pas de souris ;
 *   — `tabIndex` et l'anneau de focus retires avec, faute d'action a
 *     declencher : un element focusable qui ne fait rien est un piege au
 *     clavier. L'agrandissement est un confort de survol, pas un contenu.
 * Le contenu arrive en propriete au lieu d'etre code en dur dans le fichier.
 */

import Image from "next/image";

export type AccordionItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
};

export default function TailwindImageAccordion({
  items,
  label,
}: {
  items: readonly AccordionItem[];
  label: string;
}) {
  return (
    <ul
      aria-label={label}
      className="group m-0 flex list-none flex-col gap-2 p-0 md:flex-row"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="relative w-full overflow-hidden bg-ink transition-[width] duration-300 ease-[cubic-bezier(.5,.85,.25,1.15)] md:not-[&:hover]:group-hover:w-[13%]"
        >
          <Image
            src={item.src}
            alt={item.alt}
            width={900}
            height={1200}
            sizes="(min-width: 860px) 30vw, 100vw"
            className="h-64 w-full object-cover grayscale md:h-[26rem]"
          />
          {/* Aplat d'encre, pas de degrade : la legende se mesure sur des
              pixels pleins, vert sur noir, 13.21:1. */}
          {/* Hauteur fixe, texte cale en bas. Les six intitules ne font pas le
              meme nombre de lignes — « Image Rights and Earnings Optimization »
              en prend trois, « Legacy Planning » une — et six bandes noires
              qui ne commencent pas a la meme hauteur se lisent comme un defaut
              d'alignement, pas comme une variation. */}
          <span className="label absolute inset-x-0 bottom-0 flex min-h-11 items-end bg-ink px-3 py-3 text-lime [line-height:1.5] md:min-h-[5.25rem]">
            {item.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
