import { Distinto, SectionHead } from "@/components/site/section-head"
import { site } from "@/lib/site"
import { pad } from "@/lib/utils"

export function About() {
  return (
    <section id="nosotros" aria-labelledby="nosotros-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHead n={4} label="Nosotros" crumb="nosotros" titleId="nosotros-title" title="Somos dos." />

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-10">
          <p className="reveal type-body max-w-[46ch] text-body lg:col-span-5">
            Fundamos METALEVEL code para hacer páginas que se noten en el resultado, no en el discurso. Cuando nos
            escribes, hablas con quienes la van a hacer.
          </p>
          <ul className="reveal border-t border-line lg:col-span-6 lg:col-start-7">
            {site.founders.map((f, i) => (
              <li
                key={f.name}
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-line py-7 sm:grid-cols-[3rem_1fr_auto]"
              >
                <span className="type-crumb text-label tabular-nums">{pad(i + 1)}</span>
                <span className="text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] leading-tight font-normal tracking-[-0.012em] text-heading">
                  {f.name}
                </span>
                <span className="col-start-2 mt-1 type-crumb text-gris-texto sm:col-start-3 sm:mt-0">{f.role}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="reveal type-statement mt-28 max-w-[14ch] text-balance text-heading md:mt-40">
          Una plantilla <Distinto className="mx-[0.04em]" /> una página pensada.
        </p>
      </div>
    </section>
  )
}
