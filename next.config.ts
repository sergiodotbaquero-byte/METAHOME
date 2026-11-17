import type { NextConfig } from "next";

// GitHub Pages sirve la página bajo el nombre del repositorio:
// https://<usuario>.github.io/METAHOME/. La Action de despliegue
// (.github/workflows/pages.yml) pasa esa ruta en NEXT_PUBLIC_BASE_PATH;
// en local queda vacía y la página vive en la raíz.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Una página estática: `next build` deja HTML, CSS, JS e imágenes en out/,
  // listos para cualquier hosting estático (GitHub Pages incluido).
  output: "export",
  basePath,
  // Sin cacheComponents ni partialPrefetching: piden un servidor (prerenderizado
  // parcial) y GitHub Pages solo sirve archivos. La página es estática igual.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
