import { cn, pad } from "@/lib/utils"

/**
 * La línea de nivel que abre cada sección: el número y la etiqueta a la
 * izquierda, la línea, y la ruta a la derecha. Se traza al entrar en pantalla.
 */
export function SectionLine({
  n,
  label,
  crumb,
  className,
}: {
  n: number
  label: string
  crumb: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <span className="type-label text-label tabular-nums">{pad(n)}</span>
      <span className="type-label text-niebla">{label}</span>
      <span aria-hidden="true" className="linea-seccion h-px min-w-6 flex-1 bg-line" />
      <span className="type-crumb hidden text-gris-tenue sm:inline">
        metalevel <span className="text-label">/</span> {crumb}
      </span>
    </div>
  )
}

/**
 * Cabecera de sección: la línea de nivel y, colgado debajo, el título. La
 * entrada va debajo del título o, con `aside`, a su derecha en pantallas anchas.
 */
export function SectionHead({
  n,
  label,
  crumb,
  title,
  titleId,
  intro,
  aside = false,
  className,
}: {
  n: number
  label: string
  crumb: string
  title: React.ReactNode
  titleId?: string
  intro?: React.ReactNode
  aside?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <SectionLine n={n} label={label} crumb={crumb} />
      <div className={cn("mt-12 md:mt-16", aside && "lg:grid lg:grid-cols-12 lg:items-end lg:gap-10")}>
        <h2
          id={titleId}
          className={cn("reveal type-display max-w-[17ch] text-balance text-heading", aside && "lg:col-span-7")}
        >
          {title}
        </h2>
        {intro ? (
          <div
            className={cn(
              "reveal type-body mt-6 max-w-[52ch] text-body",
              aside && "lg:col-span-4 lg:col-start-9 lg:mt-0 lg:pb-2"
            )}
          >
            {intro}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** «!=» en JetBrains Mono: la ligadura dibuja el signo de distinto. */
export function Distinto({ className }: { className?: string }) {
  return (
    <>
      {/* Con espaciado entre letras el navegador apaga las ligaduras: aquí va en cero. */}
      <span aria-hidden="true" className={cn("font-mono font-normal tracking-normal text-label", className)}>
        !=
      </span>
      <span className="sr-only">es distinto de</span>
    </>
  )
}
