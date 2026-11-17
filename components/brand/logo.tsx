import { cn } from "@/lib/utils"

/**
 * El símbolo — Ruta 4, «Giro». Una M de ángulos rectos girada 45°: su valle
 * queda convertido en una L (en Ultramar) y sus dos astas, en barras.
 * `small` usa el trazo grueso de la versión para tamaños pequeños.
 */
export function Simbolo({
  className,
  small = false,
  mono = false,
}: {
  className?: string
  small?: boolean
  /** Todo en el color del texto, para fondos en Ultramar. */
  mono?: boolean
}) {
  const stroke = small ? 9 : 5.5
  return (
    <svg viewBox="-6 -6 112 112" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth={stroke} strokeLinecap="round">
        <path d="M0 54 54 0" />
        <path d="M100 46 46 100" />
      </g>
      <path
        d="M54 0v46h46"
        className={mono ? "stroke-current" : "stroke-ultramar"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/** METALEVEL, siempre así. Nunca Metalevel, MetaLevel ni Meta Level. */
export function Wordmark({ className, codeClassName }: { className?: string; codeClassName?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-[0.7em] whitespace-nowrap", className)}>
      <span className="font-medium tracking-[0.32em]">METALEVEL</span>
      <span className={cn("font-mono text-[0.84em] tracking-[0.18em] text-ultramar-claro", codeClassName)}>code</span>
    </span>
  )
}

/** Logotipo apilado: símbolo, METALEVEL y debajo code. */
export function LogoApilado({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-4", className)}>
      <Simbolo className="size-12 text-white" />
      <span className="flex flex-col gap-1.5">
        <span className="text-[1.35rem] leading-none font-medium tracking-[0.32em] text-white">METALEVEL</span>
        <span className="font-mono text-[0.8rem] leading-none tracking-[0.42em] text-gris-texto">code</span>
      </span>
    </span>
  )
}
