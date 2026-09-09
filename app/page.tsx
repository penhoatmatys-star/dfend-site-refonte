import BrandButton from "@/components/brand-button";
import ContactSection from "@/components/contact-section";
import FigureBw from "@/components/figure-bw";
import FigureHover from "@/components/figure-hover";
import FortivaBlock from "@/components/fortiva-block";
import GlyphHinge from "@/components/glyph-hinge";
import HeroBackdrop from "@/components/hero-backdrop";
import HeroHeadline from "@/components/hero-headline";
import MethodRail from "@/components/method-rail";
import OfficesBand from "@/components/offices-band";
import OrbitField from "@/components/ui/orbit-field";
import CoverflowCarousel from "@/components/ui/coverflow-carousel";
import { TestimonialsMarquee } from "@/components/ui/testimonials-with-marquee";
import {
  AUDIENCES,
  MATERIALS,
  OBJECTIVES,
  PHOTOS,
  SITE,
  TESTIMONIALS,
} from "@/lib/content";

/* L'ordre des sections est celui de dfend.swiss, releve au rendu le
 * 2026-09-07 et reproduit a la demande du client :
 *
 *   heros -> Fortiva -> on and off the field -> how it works -> our customers
 *   -> our services -> ce que disent les clients -> ou l'on est -> contact
 *
 * Deux ajouts au fil du site actuel, et ils ne deplacent rien : la charniere
 * du mot-symbole, qui fait le passage du vert a la nuit, et la bande des
 * implantations, qui remplace la ligne d'adresses du pied de page Wix.
 */
export default function Home() {
  return (
    <>
      {/* --- le heros -------------------------------------------------------
          Le sol du heros est la video, et le vert n'apparait plus que dans
          l'entaille a 41 degres du bas-droit et dans le titre. C'est un ecart
          assume a « le vert comme sol » : la coupe verte qui mord la derniere
          image reste le premier geste de marque de la page.
          `isolate` borne le contexte d'empilement : le fond est en dessous, le
          contenu au-dessus, et rien ne remonte au-dessus de l'en-tete. */}
      <section className="on-night relative isolate flex min-h-[clamp(460px,74svh,660px)] items-center overflow-hidden bg-night text-chalk">
        <HeroBackdrop />
        <div className="wrap relative z-10 py-[clamp(28px,4vw,56px)]">
          <div className="md:max-w-[60%]">
            <h1 className="max-w-[17ch] text-4xl text-lime [font-variation-settings:'wdth'_118,'wght'_900]">
              <HeroHeadline>{SITE.promise}</HeroHeadline>
            </h1>
            <p className="lede mt-s4">{SITE.lede}</p>
            {/* Un seul bouton dans le heros : il descend au formulaire, en bas
                de page. L'outil maison garde son appel a lui, dans le bloc
                Fortiva juste en dessous. */}
            <div className="mt-s4">
              <BrandButton href="#contact" skin="onNight">
                contact us
              </BrandButton>
            </div>
          </div>
        </div>
      </section>

      {/* --- l'outil maison, en deuxieme position comme sur dfend.swiss ----- */}
      <FortivaBlock />

      {/* --- ce que le systeme sert a faire ---------------------------------
          La piece en orbite se glisse entre la promesse et la liste : elle
          montre ce que la phrase annonce, un point fixe et six expositions
          qui tournent autour. La figure du clip est en survol, pour que rien
          ne bouge tant qu'on ne regarde pas. */}
      <section id="about" className="ground scroll-mt-24">
        <div className="wrap grid grid-cols-1 gap-s5 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="label" data-reveal>
              on and off the field
            </p>
            <h2 className="mt-s3" data-reveal>
              We&rsquo;re there for you on and off the field.
            </h2>
            <div data-reveal>
              <OrbitField
                className="mt-s2"
                label="Six exposures orbiting one fixed point: the system, as a diagram."
              />
            </div>
            <ul className="stack" data-reveal>
              {OBJECTIVES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-5 md:col-start-8" data-reveal>
            <FigureHover
              src="/video/tunnel-sport.mp4"
              poster="/img/tunnel-sport-poster.webp"
              alt="A players' tunnel opening onto a floodlit pitch, black and white"
              caption="on the field"
            />
          </div>
        </div>
      </section>

      {/* --- how it works : la methode en trois temps ----------------------- */}
      <section id="system" className="on-lime ground">
        <div className="wrap">
          <p className="label" data-reveal>
            how it works
          </p>
          <h2 className="mt-s3" data-reveal>
            We build your personal Defense Risk Mitigation System.
          </h2>
          <div data-reveal>
            <MethodRail />
          </div>
        </div>
      </section>

      {/* --- la charniere : le mot-symbole en volume, puis la nuit ---------- */}
      <GlyphHinge />

      {/* --- our customers -------------------------------------------------- */}
      <section className="on-night ground bg-night text-chalk">
        <div className="wrap grid grid-cols-1 gap-s5 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label" data-reveal>
              our customers
            </p>
            <h2 className="mt-s3" data-reveal>
              Who we work with.
            </h2>
            <ul className="stack mt-s4" data-reveal>
              {AUDIENCES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7" data-reveal>
            <FigureBw photo={PHOTOS.bureau} />
          </div>
        </div>
      </section>

      {/* --- our services, une matiere par ligne ----------------------------
          Les six intitules sont ceux du releve, mot pour mot. Ils n'ont
          toujours ni description ni tarif (todo.md #5) et rien n'est invente
          pour combler : ce qui s'ajoute ici est une image, pas une phrase. */}
      <section id="services" className="ground scroll-mt-24">
        <div className="wrap">
          <p className="label" data-reveal>
            our services
          </p>
          <h2 className="mt-s3" data-reveal>
            Six lines.
          </h2>
        </div>
        {/* Le carrousel remplace l'accordeon, a la demande du client. Une
            precaution est reprise telle quelle de l'accordeon : les six
            intitules restent lisibles en permanence, ici en pagination, parce
            qu'ils n'ont toujours ni description ni tarif (todo.md #5) et que
            le nom est donc tout ce que porte chaque prestation. */}
        <div className="mt-s4" data-reveal>
          <CoverflowCarousel slides={MATERIALS} label="Our six lines of cover" />
        </div>
      </section>

      {/* --- ce que disent les clients --------------------------------------
          Trois avis, aucun portrait : coller le visage d'un inconnu a cote
          d'un nom reel fabriquerait un faux temoignage en image.
          TODO client (todo.md #23) : le mot « guaranteed » dans une citation
          nominative adossee a un produit d'assurance. Arbitrage ecrit attendu
          avant mise en ligne — la carte porte `data-legal-review`. */}
      <section id="testimonials" className="on-lime ground scroll-mt-24">
        <div className="wrap">
          <p className="label" data-reveal>
            what our clients say
          </p>
          <h2 className="mt-s3 max-w-[18ch]" data-reveal>
            In their words.
          </h2>
        </div>
        <div className="mt-s4" data-reveal>
          <TestimonialsMarquee
            testimonials={TESTIMONIALS.map((item) => ({
              text: item.quote,
              author: { name: item.author, affiliation: item.affiliation },
              legalReview: "legalReview" in item ? item.legalReview : undefined,
            }))}
            label="What our clients say"
          />
        </div>
      </section>

      {/* --- ou l'on est ----------------------------------------------------- */}
      <OfficesBand />

      {/* --- contact, en bas de page ---------------------------------------- */}
      <ContactSection id="contact" />
    </>
  );
}
