export { cn } from "cn"

/** 1 → «01». Cifras de la marca, siempre a dos dígitos. */
export const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Una ruta de public/ con la ruta base del sitio (en GitHub Pages, /METAHOME;
 * en local, nada). Next la agrega solo a sus enlaces, no a un <img> propio.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`
