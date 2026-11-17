export { cn } from "cn"

/** 1 → «01». Cifras de la marca, siempre a dos dígitos. */
export const pad = (n: number) => String(n).padStart(2, "0")
