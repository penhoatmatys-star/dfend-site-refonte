import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le dossier parent porte l'application Fortiva Pro et son propre
  // package-lock : sans cette racine, Turbopack remonte trop haut et trace
  // des fichiers qui ne nous regardent pas.
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
