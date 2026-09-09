import type { Metadata, Viewport } from "next";
import IntroMount from "@/components/intro-mount";
import Reveals from "@/components/reveals";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import WhatsAppButton from "@/components/whatsapp-button";
import { SITE } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: "dfend — protection for people who perform",
    template: "%s — dfend",
  },
  description:
    "dfend insurance brokers, Lugano. Identify, mitigate and optimize lifestyle risk exposure for professional athletes and their families.",
  openGraph: {
    type: "website",
    siteName: "dfend",
    images: ["/img/og.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.svg",
    apple: "/img/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  /* La couleur que Chrome sous Android peint autour de la page. Elle etait
     restee au #C7D65D releve au pixel sur le verrou de logo, alors que le
     reste du site est passe au #C6D75B du groupe le 2026-09-07 : la barre du
     navigateur servait donc l'ancien vert. Ecrit en hexadecimal et non en
     jeton, parce que cette valeur part dans une balise `<meta>` et qu'une
     variable CSS n'y est pas resolue. */
  themeColor: "#C6D75B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* La langue reste une question ouverte cote client : le site actuel
       declare `it`, ecrit son accueil en anglais et sa reservation en
       italien. Voir tasks/todo.md #1. En attendant, on declare ce qui est
       reellement ecrit sur la page. */
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/font/archivo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/font/newsreader-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        {/* Bloquant a l'analyse, donc execute avant la premiere peinture :
            le heros ne clignote pas une frame sous le rideau. Une balise
            externe simple, pas `next/script` : en `beforeInteractive` celui-ci
            se contente d'empiler le script dans une file executee apres
            l'hydratation, et le script en ligne qu'il ecrit dans le body fait
            echouer la reconciliation (React #418).
            Sans JavaScript, ce fichier ne court pas, la classe n'existe pas,
            et la page reste entiere. */}
        <script src="/intro-boot.js" async />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="label sr-only bg-lime px-4 text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:inline-flex focus:min-h-11 focus:items-center"
        >
          skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppButton />
        <Reveals />
        {/* Le rideau est le dernier enfant du body : le selecteur qui masque
            la page pendant l'ouverture vise `body > *:not(#intro)`. */}
        <IntroMount />
      </body>
    </html>
  );
}
