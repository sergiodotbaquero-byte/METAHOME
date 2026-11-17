import { cn } from "@/lib/utils"

const k = "text-ultramar-claro" // palabras clave en Ultramar Claro
const c = "text-gris-tenue" // comentarios

// Una línea por fila. La que sube de nivel va marcada.
const lines: { code: React.ReactNode; mark?: boolean }[] = [
  { code: <span className={c}>{"// METALEVEL code"}</span> },
  {
    code: (
      <>
        <span className={k}>const</span> subirDeNivel = (idea) <span className={k}>{"=>"}</span> ({"{"}
      </>
    ),
  },
  { code: "  ...idea," },
  {
    code: (
      <>
        {"  "}nivel: idea.nivel + <span className={k}>1</span>,
      </>
    ),
    mark: true,
  },
  {
    code: (
      <>
        {"  "}legible: <span className={k}>true</span>,
      </>
    ),
  },
  { code: "});" },
]

/**
 * El código como imagen: una ventana de editor en el Nivel −2, texto en Gris
 * Niebla y palabras clave en Ultramar Claro. JetBrains Mono dibuja => como flecha.
 */
export function CodeFigure({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "rounded-md border border-line bg-hondo shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_32px_64px_-32px_rgb(0_0_0/0.7)]",
        className
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <span className="type-crumb text-gris-texto">siguiente-nivel.js</span>
        {/* La barra, como marca de la ventana. */}
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
          <path d="M3 13 13 3" className="stroke-ultramar" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </figcaption>
      <pre className="overflow-x-auto py-5 font-mono text-[0.8125rem] leading-7 text-niebla md:py-7 md:text-base md:leading-8">
        <code className="block min-w-max">
          {lines.map((line, i) => (
            <span
              key={i}
              className={cn(
                "flex pr-6",
                line.mark && "bg-ultramar/[0.13] shadow-[inset_2px_0_0_var(--color-ultramar)]"
              )}
            >
              <span aria-hidden="true" className="w-11 shrink-0 pr-4 text-right text-gris-tenue/70 select-none md:w-14 md:pr-5">
                {i + 1}
              </span>
              <span className="whitespace-pre">{line.code}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
