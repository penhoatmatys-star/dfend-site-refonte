import type { Metadata } from "next";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "legal notice",
  description: "Publisher, content, data protection and applicable law for dfend.swiss.",
  robots: { index: false, follow: true },
};

export default function Legal() {
  return (
    <>
      <section className="on-lime bg-lime py-[clamp(56px,8vw,104px)] text-ink">
        <div className="wrap">
          <p className="label">legal</p>
          <h1 className="mt-s3">Legal notice.</h1>
        </div>
      </section>

      <section className="ground">
        <div className="wrap max-w-[46rem]">
          <h3 data-reveal>Publisher</h3>
          <p className="mt-s2" data-reveal>
            dfend, via Balestra 10, 6900 Lugano, Switzerland. Contact:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
            >
              {SITE.email}
            </a>
          </p>
          {/* TODO client (todo.md #9) : raison sociale exacte, forme juridique,
              numero IDE (CHE-...), personne responsable. La page n'est pas
              publiable tant que ces quatre champs manquent. */}
          {/* TODO client (todo.md #10) : numero de registre FINMA de
              l'intermediaire d'assurance et statut, lie ou non lie. Mention
              obligatoire a l'affichage. */}
          {/* TODO client (todo.md #11, #12) : assurance RC professionnelle et
              mode de remuneration, commissions ou honoraires. */}
          {/* TODO client (todo.md #7) : section « Hosting » a reinserer ici avec
              le nom et l'adresse de l'hebergeur, une fois l'hebergement choisi
              et le DNS repointe. Pas de phrase d'attente publiee : c'est
              exactement ce qu'on reproche aux quatre pages Wix actuelles. */}

          <h3 className="mt-s5" data-reveal>
            Content
          </h3>
          <p className="mt-s2" data-reveal>
            The information on this site is general information about our
            activity. It is not personalised advice and does not constitute an
            offer. Any cover depends on the terms of the policy actually issued
            by the insurer.
          </p>

          <h3 className="mt-s5" data-reveal>
            Data protection
          </h3>
          <p className="mt-s2" data-reveal>
            This site sets no cookies, runs no analytics and loads no
            third-party resources. Typefaces are served from this domain, so
            your browser makes no request to an outside provider while reading
            these pages. Writing to us at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
            >
              {SITE.email}
            </a>{" "}
            means your message and address reach our mailbox; we use them to
            answer you and for nothing else.
          </p>
          {/* TODO client (todo.md #13, #14) : declaration LPD complete, RGPD si
              des visiteurs de l'UE sont cibles, responsable du traitement,
              sous-traitants, duree de conservation. Si une mesure d'audience
              est ajoutee plus tard, il faudra un bandeau avec refus reel. */}

          <h3 className="mt-s5" data-reveal>
            Intellectual property
          </h3>
          <p className="mt-s2" data-reveal>
            The dfend name, the wordmark and the contents of this site belong to
            their respective owners. Photographs are used with their licences.
          </p>
          {/* TODO client (todo.md #15) : licences des cinq photographies
              reprises du site actuel. */}

          <h3 className="mt-s5" data-reveal>
            Applicable law
          </h3>
          <p className="mt-s2" data-reveal>
            Swiss law applies. Place of jurisdiction: Lugano, Switzerland.
          </p>
        </div>
      </section>
    </>
  );
}
