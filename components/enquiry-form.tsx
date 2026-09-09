"use client";

/* Le formulaire.
 *
 * Il marche sans JavaScript. `useActionState` rend une action deja
 * progressive : le navigateur poste le formulaire, le serveur repond la page
 * entiere avec les erreurs et les valeurs deja saisies. Avec JavaScript, la
 * meme action revient sans recharger et le bouton passe a « sending ».
 *
 * Rien n'est masque en CSS. Les messages d'erreur n'existent pas dans le DOM
 * tant qu'ils n'ont pas ete produits par le serveur : c'est la meme regle que
 * les revelations au defilement, aucun etat initial en CSS.
 *
 * Les champs sont dans l'ordre ou on y repond, et un seul par ligne jusqu'a
 * 860px. Le champ appat est le seul element deplace hors de l'ecran, et il
 * porte `tabIndex={-1}` pour ne pas etre un arret de tabulation invisible.
 */

import { useActionState, useId } from "react";
import { sendEnquiry } from "@/app/actions/enquiry";
import { BrandChevron, brandButtonClass } from "@/components/brand-button";
import { AUDIENCES, FORM, SITE } from "@/lib/content";
import { EMPTY } from "@/lib/enquiry";

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="label mt-s2 text-[color:var(--foreground)]">
      {/* La barre reprend l'angle du n : le site n'a pas d'icone d'alerte, et
          il n'en aura pas une pour une seule occasion. */}
      <span
        aria-hidden="true"
        className="mr-2 inline-block h-3 w-[3px] translate-y-px bg-[color:var(--foreground)]"
        style={{ transform: "skewX(-49deg)" }}
      />
      {children}
    </p>
  );
}

/* Le bouton d'envoi prend l'habillage du sol sur lequel le formulaire est
 * pose : encre sur papier ou sur vert, vert sur nuit. Un `bg-ink` pose sur la
 * nuit serait un bouton noir sur du noir. */
export default function EnquiryForm({
  skin = "ink",
}: {
  skin?: "ink" | "onNight";
}) {
  const [state, action, pending] = useActionState(sendEnquiry, EMPTY);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  return (
    <div>
      {/* Le compte rendu est annonce, quel qu'il soit. `aria-live` sur un
          conteneur toujours present : un conteneur ajoute en meme temps que
          son texte n'est pas relu par tous les lecteurs d'ecran. */}
      <p aria-live="polite" className="sr-only">
        {state.message}
      </p>

      {state.status === "sent" ? (
        <p className="lede border-t-2 border-[color:var(--foreground)] pt-s3">
          {state.message}
        </p>
      ) : (
        <form action={action} noValidate className="mt-s4 grid gap-s4">
          {state.status === "error" && state.message ? (
            <p className="border-t-2 border-[color:var(--foreground)] pt-s3">
              {state.message}{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="underline decoration-[color:var(--border)] underline-offset-4 hover:decoration-[color:var(--foreground)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[color:var(--ring)]"
              >
                {SITE.email}
              </a>
            </p>
          ) : null}

          <div className="grid gap-s4 md:grid-cols-2">
            <div>
              <label className="label block" htmlFor={id("name")}>
                {FORM.fields.name}
              </label>
              <input
                id={id("name")}
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                defaultValue={state.values.name}
                aria-invalid={state.errors.name ? true : undefined}
                aria-describedby={state.errors.name ? id("name-error") : undefined}
                className="field mt-s1"
              />
              <FieldError id={id("name-error")}>{state.errors.name}</FieldError>
            </div>

            <div>
              <label className="label block" htmlFor={id("email")}>
                {FORM.fields.email}
              </label>
              <input
                id={id("email")}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                defaultValue={state.values.email}
                aria-invalid={state.errors.email ? true : undefined}
                aria-describedby={state.errors.email ? id("email-error") : undefined}
                className="field mt-s1"
              />
              <FieldError id={id("email-error")}>{state.errors.email}</FieldError>
            </div>
          </div>

          <div>
            <label className="label block" htmlFor={id("role")}>
              {FORM.fields.role}
            </label>
            {/* Les six intitules sont ceux de « who we work with ». Aucun
                n'est ajoute pour completer la liste. */}
            <select
              id={id("role")}
              name="role"
              required
              defaultValue={state.values.role}
              aria-invalid={state.errors.role ? true : undefined}
              aria-describedby={state.errors.role ? id("role-error") : undefined}
              className="field mt-s1"
            >
              <option value="">{FORM.fields.rolePlaceholder}</option>
              {AUDIENCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FieldError id={id("role-error")}>{state.errors.role}</FieldError>
          </div>

          <div>
            <label className="label block" htmlFor={id("message")}>
              {FORM.fields.message}
            </label>
            <textarea
              id={id("message")}
              name="message"
              rows={5}
              required
              maxLength={4000}
              defaultValue={state.values.message}
              aria-invalid={state.errors.message ? true : undefined}
              aria-describedby={state.errors.message ? id("message-error") : undefined}
              className="field mt-s1 resize-y"
            />
            <FieldError id={id("message-error")}>{state.errors.message}</FieldError>
          </div>

          <div>
            <label
              className="flex min-h-11 cursor-pointer items-start gap-s2 py-1"
              htmlFor={id("consent")}
            >
              <input
                id={id("consent")}
                name="consent"
                type="checkbox"
                required
                aria-invalid={state.errors.consent ? true : undefined}
                aria-describedby={state.errors.consent ? id("consent-error") : undefined}
                className="check mt-1"
              />
              <span className="text-xs">{FORM.fields.consent}</span>
            </label>
            <FieldError id={id("consent-error")}>{state.errors.consent}</FieldError>
          </div>

          {/* Champ appat. Hors de l'ecran, hors du parcours au clavier, sans
              etiquette visible : un robot le remplit, un humain ne le voit
              jamais. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={id("company")}>Company</label>
            <input
              id={id("company")}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div>
            <button type="submit" disabled={pending} className={brandButtonClass(skin)}>
              {pending ? FORM.sending : FORM.submit}
              <BrandChevron />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
