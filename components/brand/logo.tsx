import { cn } from "@/lib/utils"

/**
 * El símbolo «Nivel»: las dos mitades de una M en niveles distintos (la derecha
 * va un nivel más arriba), cruzadas por una barra. Retícula de 3 × 3 a 45°,
 * 1 nivel = 30 unidades, trazo de 1/5 de nivel, puntas redondas.
 * `small` usa el corte pequeño (trazo más grueso) para 32 px o menos.
 * Fuente de verdad: el repositorio METABRANDING (codigo/marca.py).
 */
export function Simbolo({ className, small = false }: { className?: string; small?: boolean }) {
  return (
    <svg
      viewBox={small ? "-4.8 -4.8 99.6 99.6" : "-3 -3 96 96"}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth={small ? 9.6 : 6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 0 90 90" />
        <path d="M0 90V30l30 30" />
        <path d={small ? "M65.36 24.64 90 0v60" : "M57.73 32.27 90 0v60"} />
      </g>
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
