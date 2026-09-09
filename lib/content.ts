/* Tout le texte visible du site, en un seul endroit.
 *
 * REGLE QUI PRIME SUR TOUT : chaque chaine ci-dessous vient du releve de
 * dfend.swiss du 2026-09-05, consigne dans PRODUCT.md. Aucune duree, aucune
 * anciennete, aucun nombre de clients, aucun tarif, aucun pourcentage n'est
 * ajoute ici. Ce qui manque part en question dans tasks/todo.md.
 *
 * Ajouter une phrase dans ce fichier sans pouvoir montrer d'ou elle vient,
 * c'est faire signer un mensonge au client.
 */

export const SITE = {
  name: "dfend",
  domain: "https://www.dfend.swiss",
  promise: "Protection for people who perform.",
  lede:
    "Get your smart suite to identify, mitigate and optimize tax and lifestyle risk exposure.",
  email: "aa@dfend.swiss",
  /* Le numero du bureau, et le fil WhatsApp qui va avec.
   *
   * Il n'etait pas publiable tant qu'il ne venait que des deux sites freres,
   * qui le marquaient eux-memes comme un contact de groupe non confirme
   * (todo.md #40). Il l'est depuis le 2026-09-08 : les vingt-et-un PDF de
   * `dfend.swiss/download`, telecharges et lus, l'impriment tous en pied de
   * page sous « Andrea Albertoni », a cote de `www.dfend.swiss`. Un numero
   * imprime sur toute la documentation commerciale du client est un canal
   * publie par le client.
   *
   * `wa.me` veut le numero sans « + », sans espace et sans zero national. */
  phone: "+41 78 732 93 40",
  whatsapp: "https://wa.me/41787329340",
  instagram: "https://www.instagram.com/dfend.swiss/",
  linkedin: "https://ch.linkedin.com/company/dfend-swiss",
  // Le seul element differenciant du site actuel : l'outil maison.
  // L'URL a change le 2026-08-28 : le site frere dfendinsurance.com pointe
  // desormais sur le formulaire europeen en ligne et non plus sur l'apercu
  // `dfend-form-preview.html`. Meme outil, meme client, une seule adresse.
  fortiva: "https://fortiva-pro-production.up.railway.app/form/europe",
  parent: "Camponovo & Partners Group",
} as const;

/* L'adresse postale du siege, telle qu'elle est publiee sur dfend.swiss.
 * Une adresse ne se traduit pas, elle se recopie.
 *
 * Pas de numero de telephone ici : le site actuel n'en publie aucun, et le
 * `+41 78 732 93 40` qu'emploient les deux sites freres y est marque comme un
 * contact de groupe non confirme. Le publier reviendrait a inventer un canal.
 * Question 40 de tasks/todo.md. */
export const ADDRESS = [
  "via Balestra 10",
  "6900 Lugano",
  "Switzerland",
] as const;

const MAP_QUERY = encodeURIComponent(ADDRESS.join(", "));
/* Encart Google sans cle : `output=embed` sur une simple requete ne demande ni
 * cle d'API ni compte de facturation, donc la carte ne peut pas casser quand
 * une cle tourne. MAP_LINK est la meme requete sans le drapeau d'encart. */
export const MAP_EMBED = `https://www.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`;
export const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

/* L'ecosysteme du groupe, en bas de page.
 *
 * Deux niveaux et ils ne se melangent pas : dfend group est membre de
 * Camponovo & Partners Group, et deux enseignes vivent sous dfend group.
 * Les libelles restent en anglais dans tous les cas, ce sont des noms
 * d'entreprise et non du texte a traduire.
 *
 * Les deux verrous verts sont deja detoures en blanc sur transparent dans
 * public/img : ils viennent du releve du site actuel. La plaque Camponovo est
 * noire sur blanc et arrive du site frere dfendassociates ; elle est donc
 * posee sur un aplat blanc, sinon elle disparait sur la nuit. */
export const ECOSYSTEM = {
  memberLabel: "member of",
  member: {
    name: "Camponovo & Partners Group",
    href: "https://www.camponovogroup.com/",
    src: "/img/logo-camponovo-partners.png",
    width: 760,
    height: 287,
    plate: true,
  },
  housesLabel: "the dfend group ecosystem",
  houses: [
    {
      name: "dfend insurance brokers",
      href: "https://dfendinsurance.com",
      src: "/img/logo-dfend-insurance-brokers-white.png",
      width: 788,
      height: 149,
    },
    {
      name: "dfend associates",
      href: "https://dfend.associates",
      src: "/img/logo-dfend-associates-white.png",
      width: 917,
      height: 164,
    },
  ],
} as const;

/* Le site tient sur une seule page. Les quatre onglets ne sont pas des routes,
 * ils descendent a la section qui porte leur matiere : le mot-symbole en haut
 * a gauche est le seul chemin vers le haut de page, et `/download` la seule
 * page a part entiere de l'en-tete. Chaque cible existe comme `id` dans
 * app/page.tsx et porte un `scroll-mt` qui degage l'en-tete colle. */
export const NAV = [
  { href: "/#about", label: "about" },
  { href: "/#services", label: "services" },
  { href: "/#testimonials", label: "testimonials" },
  { href: "/#contact", label: "contact" },
] as const;

/* « We build your personal Defense Risk Mitigation System to help you: »
 * Note : « Saving taxes » figurait dans cette liste sur le site actuel. Ligne
 * retiree, promesse de resultat fiscal par un courtier en assurance, voir
 * todo.md #22. Un mot du client et elle revient ici. */
export const OBJECTIVES = [
  "Perform without distractions",
  "Protect what you build",
  "Reduce risks",
  "Secure your income",
  "Prepare your life after sport",
  "Maintain your lifestyle",
] as const;

export const SERVICES = [
  "Lifestyle Risk Mitigation",
  "Income and Family Protection",
  "Image Rights and Earnings Optimization",
  "Career and Contract Protection",
  "Post-Career Transition",
  "Legacy Planning",
] as const;

export const AUDIENCES = [
  "Professional Athletes",
  "Performers",
  "Agents",
  "HNWI Families",
  "Clubs, Federations, Brands",
  "Sport Investors",
] as const;

/* La methode en trois temps. C'est la seule liste du site qui porte des
 * numeros, parce que c'est la seule ou l'ordre dit quelque chose. */
export const METHOD = [
  { key: "analyze", head: "Analyze your lifestyle and exposure." },
  { key: "design", head: "Design your protection architecture." },
  { key: "monitor", head: "Monitor and optimize your system." },
] as const;

export const OFFICES = [
  { label: "head office", value: "via balestra 10 | 6900 lugano, switzerland" },
  { label: "group offices", value: "malta | montecarlo | london | dubai" },
  { label: "partner offices", value: "geneva | zurich | barcelona | paris" },
] as const;

/* Les trois temoignages.
 *
 * Le premier est le seul qui figure sur dfend.swiss : le carrousel Wix ne
 * sert qu'une diapositive dans son HTML, verifiee au rendu le 2026-09-07.
 * Les deux autres viennent du client, transmis le 2026-09-07. Les deux faux
 * temoignages du blog, « Marco Rossi » et « Luca Bianchi », ne sont toujours
 * pas repris et ne le seront jamais (todo.md #21).
 *
 * **Aucun portrait.** Le composant d'origine tire de 21st.dev affiche un
 * avatar par carte et sa notice conseille de le remplir avec des photos
 * Unsplash. Coller le visage d'un inconnu a cote de « Morgan Poaty, FC
 * Lausanne-Sport » fabriquerait le portrait d'une personne reelle et nommee :
 * c'est exactement la regle du projet sur les visuels de synthese. Les cartes
 * portent donc les initiales, tracees, pas photographiees.
 *
 * `legalReview` marque le mot « guaranteed » adosse a un produit d'assurance
 * et a un client nomme : arbitrage ecrit attendu avant mise en ligne,
 * todo.md #23. */
export const TESTIMONIALS = [
  {
    quote:
      "Impeccable service, a team always available, and quick solutions: my peace of mind is guaranteed.",
    author: "Morgan Poaty",
    affiliation: "FC Lausanne-Sport",
    legalReview: "todo-23",
  },
  {
    quote:
      "Collaborating with Dfend Group means being able to rely on a smart and modern partner, capable of combining efficiency, constant dialogue, and professionalism in support of our association and our artists.",
    author: "Nicola Penta",
    affiliation: "General Director, Nazionale Italiana Cantanti",
  },
  {
    quote:
      "Dfend group understood my needs and handled them with absolute competence and confidentiality.",
    author: "Jordi Quintilla",
    affiliation: "FC St. Gallen 1879",
  },
] as const;

/* Les visuels. Licences non resolues (todo.md #15) : ces cinq fichiers
 * viennent du site actuel et sont probablement des banques d'images. Ils
 * restent en place tant que le client n'a pas repondu. */
export const PHOTOS = {
  crampons: {
    src: "/img/crampons-960.webp",
    small: "/img/crampons-480.webp",
    alt: "Football boots resting on grass, black and white",
    caption: "on the field",
  },
  bureau: {
    src: "/img/bureau-960.webp",
    small: "/img/bureau-480.webp",
    alt: "Two people reviewing a document on a laptop, black and white",
    caption: "off the field",
  },
  famille: {
    src: "/img/famille-960.webp",
    small: "/img/famille-480.webp",
    alt: "A family walking through a field, black and white",
    caption: "prepare your life after sport",
  },
  poignee: {
    src: "/img/poignee-main-960.webp",
    small: "/img/poignee-main-480.webp",
    alt: "Two people shaking hands, black and white",
    caption: "on and off the field",
  },
  ballon: {
    src: "/img/ballon-nuit-900.webp",
    small: "/img/ballon-nuit-480.webp",
    alt: "A football on the ground at night, black and white",
    caption: "after the whistle",
  },
} as const;

/* Les six matieres generees, une par prestation.
 *
 * Meme regle que la boucle du heros, et elle ne se negocie pas : une matiere,
 * jamais une personne. Aucun de ces six plans ne porte de visage, de logo, de
 * chiffre ni de texte lisible. Ils illustrent une prestation, ils n'affirment
 * rien a sa place : le nom de la prestation est le seul texte du panneau, et
 * il vient du releve.
 *
 * `alt` decrit ce qu'on voit, pas ce que ca voudrait dire. Une legende du
 * genre « votre patrimoine en securite » posee sur un lac serait une promesse
 * de resultat glissee dans un texte alternatif. */
export const MATERIALS = [
  {
    id: "lifestyle",
    title: "Lifestyle Risk Mitigation",
    src: "/img/mat-tribune-900.webp",
    alt: "Empty stadium seats in raking light, black and white",
  },
  {
    id: "income",
    title: "Income and Family Protection",
    src: "/img/mat-table-900.webp",
    alt: "An empty table and two chairs in a bare room, black and white",
  },
  {
    id: "image-rights",
    title: "Image Rights and Earnings Optimization",
    src: "/img/mat-objectif-900.webp",
    alt: "A broadcast camera lens on a tripod head, black and white",
  },
  {
    id: "career",
    title: "Career and Contract Protection",
    src: "/img/mat-dossier-900.webp",
    alt: "A stack of blank paper and a pen on a bare desk, black and white",
  },
  {
    id: "post-career",
    title: "Post-Career Transition",
    src: "/img/mat-chaussures-900.webp",
    alt: "A pair of worn football boots hanging on a hook, black and white",
  },
  {
    id: "legacy",
    title: "Legacy Planning",
    src: "/img/mat-lac-900.webp",
    alt: "An alpine lake at dawn with layered ridges, black and white",
  },
] as const;

/* Le formulaire.
 *
 * Les intitules decrivent le champ et rien de plus. Aucun delai de reponse,
 * aucun « we'll get back to you within 24 hours » : le client ne s'est engage
 * sur aucun delai, et l'inventer serait un engagement pris a sa place.
 * La liste des roles est AUDIENCES, telle quelle. */
export const FORM = {
  eyebrow: "start a file",
  heading: "Tell us what you need to protect.",
  lede: "Send the outline of your situation. We answer by e-mail, from Lugano.",
  fields: {
    name: "Your name",
    email: "Your e-mail",
    role: "You are",
    rolePlaceholder: "Choose one",
    message: "What you want to protect",
    consent:
      "I agree that dfend may store and use these details to answer me.",
  },
  submit: "send message",
  sending: "sending",
  /* Un formulaire qui perd les messages en silence est pire que pas de
   * formulaire : la destination est une variable d'environnement, et si elle
   * manque, l'envoi echoue franchement avec l'adresse en clair. */
  sent: "Message sent. A copy has gone to the Lugano office.",
  fallback:
    "The form could not send your message. Write to aa@dfend.swiss instead.",
} as const;

/* Les trois rendez-vous payants de `/book-online`. C'est la seule source
 * chiffree du site actuel, publiee en italien, sans description. Rien n'est
 * traduit ni complete ici : les intitules restent tels quels.
 *
 * Plus affiche nulle part : le client a fait retirer ce bloc de l'accueil le
 * 2026-09-09. La donnee reste consignee ici, elle ne s'invente pas si elle
 * revient. Toujours valables ? Publics ? Question 5 de tasks/todo.md. */
export const APPOINTMENTS = [
  { name: "Piani Pensionistici", duration: "1 h 30", price: "CHF 200" },
  { name: "Trasferimento Club", duration: "1 h", price: "CHF 150" },
  { name: "Assicurazione Sportiva", duration: "45 min", price: "CHF 120" },
] as const;

/* Les villes seules, pour la bande defilante.
 *
 * Elles sont ecrites ici et non redecoupees depuis OFFICES : le siege y est
 * une adresse postale, et un decoupage naif faisait defiler « via balestra 10 »
 * puis « 6900 lugano » comme si c'etaient deux implantations. Onze entrees
 * dans OFFICES, neuf villes ici, et c'est normal. */
export const CITIES = [
  "lugano",
  "malta",
  "montecarlo",
  "london",
  "dubai",
  "geneva",
  "zurich",
  "barcelona",
  "paris",
] as const;
