import { Escalera } from "@/components/site/escalera"
import { Distinto, SectionHead } from "@/components/site/section-head"

const niveles = [
  {
    n: "01",
    title: "Diseño",
    text: "Entendemos qué tiene que resolver la página y para quién. Después la dibujamos.",
  },
  {
    n: "02",
    title: "Código",
    text: (
      <>
        La escribimos a la medida, sin plantillas. Una plantilla <Distinto /> una página pensada.
      </>
    ),
  },
  {
    n: "03",
    title: "Medición",
    text: "Tu página abre bien en un celular viejo. La probamos en uno antes de entregarla.",
  },
]

/**
 * Proceso. Tres niveles en escalera: cada uno cuelga de su línea de nivel y
 * las líneas suben a 45°, hacia arriba a la derecha, hasta terminar en la barra.
 */
export function Process() {
  return (
    <section id="proceso" aria-labelledby="proceso-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHead
          n={3}
          label="Proceso"
          crumb="proceso"
          titleId="proceso-title"
          title="Primero el problema. Después la tecnología."
        />

        <Escalera className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-3 lg:gap-0">
          {niveles.map((nivel, i) => (
            <li key={nivel.n} className="lg:pr-10" style={{ "--sube": niveles.length - 1 - i } as React.CSSProperties}>
              <p className="type-label text-label">Nivel {nivel.n}</p>
              <div className="escalon relative mt-4 h-px">
                <span aria-hidden="true" className="trazo absolute inset-0 bg-niebla/30" />
                {i > 0 ? <span aria-hidden="true" className="contrahuella bg-niebla/30" /> : null}
                {i === niveles.length - 1 ? <span aria-hidden="true" className="barra-final bg-ultramar" /> : null}
              </div>
              <div className="contenido">
                <h3 className="type-title mt-6 text-heading">{nivel.title}</h3>
                <p className="type-body mt-4 max-w-[34ch] text-gris-texto">{nivel.text}</p>
              </div>
            </li>
          ))}
        </Escalera>
      </div>
    </section>
  )
}
