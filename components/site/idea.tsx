import { Wordmark } from "@/components/brand/logo"
import { CodeFigure } from "@/components/site/code-figure"
import { SectionHead } from "@/components/site/section-head"

// El nombre, como una suma: meta + level + code.
const partes = [
  { op: "", word: "meta", meaning: "lo que hay más allá", tone: "text-white" },
  { op: "+", word: "level", meaning: "el nivel", tone: "text-white" },
  { op: "+", word: "code", meaning: "lo que hacemos", tone: "text-ultramar-claro" },
]

const big = "font-mono text-[clamp(2rem,1.3rem+2.8vw,3.5rem)] leading-[1.2]"

export function Idea() {
  return (
    <section id="idea" aria-labelledby="idea-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHead n={1} label="La idea" crumb="la-idea" titleId="idea-title" title="Hacemos páginas web. Bien hechas." />

        <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="reveal type-body max-w-[46ch] text-body">
              Diseñamos páginas pensadas para resolver una necesidad concreta. Primero entendemos el problema; después
              elegimos la tecnología.
            </p>
            <p className="reveal type-subtitle mt-10 max-w-[28ch] text-heading">
              <span aria-hidden="true" className="mr-3 font-mono font-normal text-label">
                /
              </span>
              Hoy se te pierden pedidos por WhatsApp.{" "}
              <span className="font-normal text-gris-texto">Una página lo arregla.</span>
            </p>
          </div>
          <CodeFigure className="reveal min-w-0 lg:col-span-6 lg:col-start-7" />
        </div>

        <div className="mt-24 grid gap-10 md:mt-32 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h3 className="type-label text-gris-texto">El nombre</h3>
          </div>
          <div className="reveal grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-4 sm:gap-x-6 lg:col-span-6 lg:col-start-7">
            <ul className="col-span-3 grid grid-cols-subgrid gap-y-1">
              {partes.map((p) => (
                <li key={p.word} className="col-span-3 grid grid-cols-subgrid items-baseline">
                  <span aria-hidden="true" className={`${big} text-label`}>
                    {p.op}
                  </span>
                  <span className={`${big} ${p.tone}`}>{p.word}</span>
                  <span className="text-base text-gris-texto md:text-lg">{p.meaning}</span>
                </li>
              ))}
            </ul>
            {/* La línea de nivel hace de raya de la suma. */}
            <div aria-hidden="true" className="col-span-3 mt-5 mb-4 h-px bg-line" />
            {/* Centrado y no por la línea base: el «=» grande queda a la altura del nombre, que es más bajo. */}
            <p className="col-span-3 grid grid-cols-subgrid items-center">
              <span aria-hidden="true" className={`${big} text-label`}>
                =
              </span>
              <span className="col-span-2">
                <Wordmark className="text-[clamp(1.25rem,0.8rem+1.9vw,2.4rem)] text-white" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
