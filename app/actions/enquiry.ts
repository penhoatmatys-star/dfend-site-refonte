"use server";

/* La destination des messages du formulaire.
 *
 * Question 4 de tasks/todo.md, tranchee par le client le 2026-09-06 : il veut
 * un formulaire. Elle laisse une question ouverte qui n'est pas de la
 * decoration — ou vont les messages. Tant qu'on n'a pas repondu, le
 * formulaire refuse franchement au lieu de faire semblant.
 *
 * Ce qui est non negociable ici :
 * — la validation est refaite cote serveur. Celle du navigateur est un
 *   confort, elle se contourne en trois lignes de console ;
 * — l'URL de destination est une variable d'environnement lue sur le serveur.
 *   Elle ne porte pas le prefixe NEXT_PUBLIC_ et ne part donc jamais dans le
 *   paquet du navigateur ;
 * — on ne renvoie jamais au visiteur ce que le serveur distant a repondu : ni
 *   son corps, ni son code, ni son URL ;
 * — une limite par adresse IP, parce qu'une action serveur s'appelle en POST
 *   direct, sans passer par la page ;
 * — un champ appat. Un robot le remplit, un humain ne le voit pas.
 *
 * Rien n'est stocke ici. Le message part vers le crochet et c'est tout : une
 * base de donnees ouvrirait une question de conservation des donnees que
 * personne n'a tranchee.
 */

import { headers } from "next/headers";
import { AUDIENCES, FORM } from "@/lib/content";
import { EMPTY, type EnquiryState } from "@/lib/enquiry";

/* Assez pour ecarter « a@b » et les champs remplis au hasard, pas assez pour
 * refuser une adresse valide exotique. Une regex plus stricte rejette de
 * vraies adresses ; c'est le serveur de destination qui tranche ensuite. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMIT = 5; // envois
const WINDOW = 10 * 60 * 1000; // par tranche de dix minutes
/* En memoire, donc remis a zero au redemarrage et non partage entre
 * instances. C'est un garde-fou, pas une protection : la vraie limite se pose
 * devant, chez l'hebergeur. */
const seen = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 5000) seen.clear();
  return hits.length > LIMIT;
}

const str = (data: FormData, key: string, max: number) =>
  String(data.get(key) ?? "").trim().slice(0, max);

export async function sendEnquiry(
  _previous: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const values = {
    name: str(data, "name", 120),
    email: str(data, "email", 200),
    role: str(data, "role", 80),
    message: str(data, "message", 4000),
  };
  const consent = data.get("consent") === "on";

  // Le champ appat est masque et sans etiquette : rempli, c'est un robot. On
  // repond « envoye » sans rien envoyer, pour ne pas lui apprendre la regle.
  if (str(data, "company", 100)) {
    return { status: "sent", message: FORM.sent, errors: {}, values: EMPTY.values };
  }

  const errors: EnquiryState["errors"] = {};
  if (values.name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL.test(values.email)) errors.email = "Enter a valid e-mail address.";
  if (!AUDIENCES.includes(values.role as (typeof AUDIENCES)[number]))
    errors.role = "Choose one of the options.";
  if (values.message.length < 20)
    errors.message = "Give us at least a couple of sentences to work from.";
  if (!consent) errors.consent = "We need your agreement before we can reply.";

  if (Object.keys(errors).length) {
    return { status: "error", message: "", errors, values };
  }

  const head = await headers();
  const ip =
    head.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    head.get("x-real-ip") ||
    "unknown";
  if (tooMany(ip)) {
    return {
      status: "error",
      message: "Too many messages from this connection. Try again later.",
      errors: {},
      values,
    };
  }

  const hook = process.env.DFEND_FORM_WEBHOOK;
  if (!hook) {
    console.error("[enquiry] DFEND_FORM_WEBHOOK absent — message non transmis");
    return { status: "error", message: FORM.fallback, errors: {}, values };
  }

  try {
    const response = await fetch(hook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.DFEND_FORM_TOKEN
          ? { authorization: `Bearer ${process.env.DFEND_FORM_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ ...values, consent, source: "dfend.swiss", ip }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
  } catch (error) {
    // Le detail reste dans le journal du serveur. Le visiteur recoit une
    // phrase et l'adresse e-mail, jamais le message d'erreur du distant.
    console.error("[enquiry] envoi refuse", error);
    return { status: "error", message: FORM.fallback, errors: {}, values };
  }

  return { status: "sent", message: FORM.sent, errors: {}, values: EMPTY.values };
}
