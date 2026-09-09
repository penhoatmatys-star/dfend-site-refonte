import Image from "next/image";
import Link from "next/link";
import LocationMap from "@/components/ui/expand-map";
import {
  ADDRESS,
  ECOSYSTEM,
  MAP_EMBED,
  MAP_LINK,
  OFFICES,
  SITE,
} from "@/lib/content";

/* Le pied de page, en deux etages.
 *
 * L'etage du haut reprend celui du site frere dfendinsurance.com : le siege en
 * carte vivante a gauche, l'adresse et les liens a droite. La carte repond a
 * une question que la section contact au-dessus ne repond pas — celle-la dit
 * comment nous joindre, celle-ci dit ou nous sommes.
 *
 * L'etage du bas est propre a ce site, et le client l'a demande explicitement.
 * Il porte deux niveaux qui ne se melangent pas :
 *
 *   dfend group est **membre de** Camponovo & Partners Group ;
 *   dfend insurance brokers et dfend associates vivent **sous** dfend group.
 *
 * Un seul bloc « member of » aurait ecrase la difference. Deux etiquettes, deux
 * rangees, et la hierarchie se lit sans qu'on l'explique.
 *
 * La plaque Camponovo est noire sur blanc : elle est donc posee sur un aplat
 * blanc pur, et non sur le papier de la marque, qui laisserait une couture
 * contre son propre fond. Les deux verrous dfend sont detoures en blanc sur
 * transparent et se posent directement sur la nuit.
 */

const LINK =
  "label inline-flex min-h-11 items-center transition-colors duration-200 hover:text-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime";

export default function SiteFooter() {
  return (
    <footer className="on-night bg-night pt-s6 pb-s4 text-chalk">
      <div className="wrap">
        <h2 className="max-w-[16ch]">{SITE.promise.toLowerCase()}</h2>

        <div className="mt-s5 grid grid-cols-1 gap-s5 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* La plaque du siege. Fermee, elle porte l'adresse et repond au
              curseur ; ouverte, elle grandit et pose la carte de Google.
              L'iframe n'arrive qu'a l'ouverture : aucun cookie tiers n'est
              depose tant que le visiteur ne demande pas la carte. */}
          <LocationMap
            location="lugano, switzerland"
            detail={ADDRESS[0]}
            src={MAP_EMBED}
            title={`dfend, ${ADDRESS.join(", ")}`}
          />

          <div className="flex flex-col">
            <p className="label text-lime">head office</p>
            <address className="mt-s2 text-sm not-italic text-chalk-soft">
              {ADDRESS.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <p className="mt-s3">
              <a href={MAP_LINK} rel="noopener noreferrer external" className={`${LINK} text-lime`}>
                get directions
              </a>
            </p>

            <p className="mt-s3">
              <a
                href={SITE.whatsapp}
                rel="noopener noreferrer external"
                className="inline-flex min-h-11 items-center underline decoration-rule-chalk underline-offset-4 transition-colors duration-200 hover:text-lime hover:decoration-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
              >
                {SITE.phone}
              </a>
            </p>

            <p className="mt-s3">
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex min-h-11 items-center underline decoration-rule-chalk underline-offset-4 transition-colors duration-200 hover:text-lime hover:decoration-lime focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
              >
                {SITE.email}
              </a>
            </p>

            <div className="mt-s4 grid gap-s3 sm:grid-cols-2">
              {OFFICES.slice(1).map((office) => (
                <p key={office.label} className="text-chalk-soft">
                  <strong className="label mb-1 block text-chalk">
                    {office.label}
                  </strong>
                  {office.value}
                </p>
              ))}
            </div>

            <ul className="mt-auto flex list-none flex-wrap gap-s4 p-0 pt-s4">
              {[
                { href: "/download", label: "downloads", external: false },
                { href: "/legal", label: "legal notice", external: false },
                { href: SITE.instagram, label: "instagram", external: true },
                { href: SITE.linkedin, label: "linkedin", external: true },
              ].map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} rel="noopener noreferrer external" className={LINK}>
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={LINK}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- l'ecosysteme -------------------------------------------------- */}
        <div className="mt-s6 grid grid-cols-1 gap-s5 border-t border-rule-chalk pt-s5 md:grid-cols-2">
          <div>
            <p className="label text-lime">{ECOSYSTEM.memberLabel}</p>
            <a
              href={ECOSYSTEM.member.href}
              rel="noopener noreferrer external"
              aria-label={`${ECOSYSTEM.member.name}, opens in a new tab`}
              /* Aplat blanc pur, et non le papier de la marque : la plaque
                 Camponovo porte son propre fond blanc, et le papier laisserait
                 une couture d'un ton contre l'autre. */
              className="mt-s3 inline-flex h-20 items-center bg-chalk px-5 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
            >
              <Image
                src={ECOSYSTEM.member.src}
                alt={ECOSYSTEM.member.name}
                width={ECOSYSTEM.member.width}
                height={ECOSYSTEM.member.height}
                className="h-12 w-[127px]"
              />
            </a>
          </div>

          <div>
            <p className="label text-lime">{ECOSYSTEM.housesLabel}</p>
            <ul className="mt-s3 flex list-none flex-wrap items-center gap-s4 p-0">
              {ECOSYSTEM.houses.map((house) => (
                <li key={house.name}>
                  <a
                    href={house.href}
                    rel="noopener noreferrer external"
                    aria-label={`${house.name}, opens in a new tab`}
                    className="inline-flex min-h-11 items-center transition-opacity duration-200 hover:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime"
                  >
                    <Image
                      src={house.src}
                      alt={house.name}
                      width={house.width}
                      height={house.height}
                      className="h-7 w-auto"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-s5 flex flex-wrap justify-between gap-s2 border-t border-rule-chalk pt-s3 text-chalk-soft">
          <span className="label">dfend group</span>
          <span className="label">&copy; 2026 dfend</span>
        </div>
      </div>
    </footer>
  );
}
