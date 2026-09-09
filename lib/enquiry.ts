/* La forme de l'etat du formulaire, et son etat de depart.
 *
 * Ces deux-la vivent ici et non dans `app/actions/enquiry.ts` parce qu'un
 * module marque `"use server"` ne publie que des fonctions asynchrones : tout
 * autre export y est retire du paquet et arrive `undefined` cote client. Le
 * build de production le dit franchement, le serveur de developpement non.
 */

export type EnquiryState = {
  status: "idle" | "sent" | "error";
  message: string;
  /* Les erreurs sont renvoyees champ par champ pour que chaque message
   * s'affiche sous son champ et soit annonce par `aria-describedby`. Un
   * resume en haut de formulaire oblige a chercher. */
  errors: Partial<Record<"name" | "email" | "role" | "message" | "consent", string>>;
  /* Ce que le visiteur avait tape est renvoye tel quel : sans JavaScript, la
   * page est reconstruite et un formulaire vide lui ferait tout retaper. */
  values: { name: string; email: string; role: string; message: string };
};

export const EMPTY: EnquiryState = {
  status: "idle",
  message: "",
  errors: {},
  values: { name: "", email: "", role: "", message: "" },
};
