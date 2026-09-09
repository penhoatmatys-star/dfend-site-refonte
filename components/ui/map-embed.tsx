"use client";

/* La carte du siege, chargee seulement quand on la demande.
 *
 * Reprise du site frere dfendinsurance.com. L'iframe de Google n'est posee
 * qu'au clic : tant qu'on n'y touche pas, le site ne depose aucun cookie
 * tiers et n'envoie l'IP du visiteur a personne. C'est la meme raison qui
 * fait servir les polices depuis le domaine plutot que depuis un CDN.
 *
 * Les tuiles de Google sont claires et colorees. `grayscale` puis `invert`
 * est ce qui retourne le fond blanc en sombre tout en gardant les routes et
 * les libelles lisibles ; l'interaction survit au filtre, seule la peinture
 * change. Coins droits, comme tout le reste.
 */

import { useState } from "react";

export default function MapEmbed({
  src,
  title,
  prompt,
  action,
}: {
  src: string;
  title: string;
  prompt: string;
  action: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 grayscale invert"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group absolute inset-0 flex flex-col items-center justify-center gap-s2 p-s3 text-center focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-lime"
    >
      <span className="label text-chalk-soft">{prompt}</span>
      <span className="label inline-flex min-h-11 items-center border border-rule-chalk px-4 text-chalk transition-colors duration-200 group-hover:border-lime group-hover:bg-lime group-hover:text-ink">
        {action}
      </span>
    </button>
  );
}
