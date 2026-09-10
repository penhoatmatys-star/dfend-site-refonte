/* La section contact, en bas de l'accueil et sur /contact.
 *
 * La mise en page vient du site frere dfendinsurance.com, a la demande du
 * client : les coordonnees a gauche en liste de definitions reglee au filet,
 * le formulaire a droite dans une plaque, et le champ de vecteurs vert en
 * fond. C'est le meme geste sur les trois sites du groupe.
 *
 * Deux ecarts, tous deux imposes par ce projet-ci :
 *
 * — **Pas de numero de telephone.** Le site frere en publie un et le marque
 *   lui-meme comme un contact de groupe non confirme. dfend.swiss n'en publie
 *   aucun : le recopier ici inventerait un canal. Question 40 de todo.md.
 * — **Le formulaire poste vraiment.** Celui du site frere ouvre un `mailto:`,
 *   faute de back-end. Celui-ci passe par une action serveur, revalide tout,
 *   et refuse franchement si la destination n'est pas configuree.
 *
 * Le degrade haut-bas de l'original devient deux aplats. Le projet n'a aucun
 * degrade, et le champ de vecteurs se suffit : il est deja sombre sur ses
 * bords puisque les trainees s'estompent vers la nuit.
 */

import EnquiryForm from "@/components/enquiry-form";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import { ADDRESS, FORM, MAP_LINK, SITE } from "@/lib/content";

const ROW =
  "flex flex-wrap items-baseline gap-x-s3 gap-y-1 border-b border-rule-chalk py-s2";

export default function ContactSection({ id = "contact" }: { id?: string }) {
  return (
    <section
      id={id}
      className="on-night relative isolate scroll-mt-24 overflow-hidden bg-night pt-[clamp(64px,9vw,104px)] pb-32 text-chalk md:pb-[clamp(64px,9vw,104px)]"
    >
      {/* Le champ est tenu a 55 % : les champs du formulaire doivent rester la
          chose la plus claire de la section. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-55">
        <FlowFieldBackground />
      </div>

      <div className="wrap grid grid-cols-1 gap-s5 lg:grid-cols-12 lg:gap-s6">
        <div className="lg:col-span-5">
          <p className="label" data-reveal>
            {FORM.eyebrow}
          </p>
          <h2 className="mt-s3" data-reveal>
            {FORM.heading}
          </h2>
          <p className="lede mt-s4" data-reveal>
            {FORM.lede}
          </p>

          <dl className="mt-s5 border-t border-rule-chalk" data-reveal>
            <div className={ROW}>
              <dt className="label">head office</dt>
              <dd className="m-0 text-sm text-chalk-soft">
                {ADDRESS.join(", ")}
              </dd>
            </div>
            <div className={ROW}>
              <dt className="label">e-mail</dt>
              <dd className="m-0">
                <a
                  href={`mailto:${SITE.email}`}
                  className="-my-2 inline-flex min-h-11 items-center text-sm text-chalk-soft transition-colors duration-200 hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
                >
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div className={ROW}>
              <dt className="label">directions</dt>
              <dd className="m-0">
                <a
                  href={MAP_LINK}
                  rel="noopener noreferrer external"
                  className="label -my-2 inline-flex min-h-11 items-center text-lime transition-opacity duration-200 hover:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
                >
                  open in maps
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7" data-reveal>
          {/* La plaque : un filet, un fond a peine plus clair que la nuit, et
              un flou d'arriere-plan pour que les trainees ne traversent pas
              les champs. Rayon zero, comme tout le reste. */}
          <div className="border border-rule-chalk bg-night/55 p-s3 backdrop-blur-sm sm:p-s4">
            <EnquiryForm skin="onNight" />
          </div>
        </div>
      </div>
    </section>
  );
}
