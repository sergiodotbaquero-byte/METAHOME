"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import TumbleDeckShowcase, { type TumbleDeckHandle } from "@/components/ui/tumble-deck-showcase"
import { Button } from "@/components/ui/button"
import { SectionHead } from "@/components/site/section-head"
import { cardFor, projects, PROJECT_EVENT } from "@/lib/work"
import { cn, pad } from "@/lib/utils"

const SIZES = "(max-width: 420px) 76vw, (min-width: 1700px) 1080px, 62vw"

/** Dónde va la marca: sobre los dos píxeles de abajo de la pestaña elegida, a su ancho. */
const markAt = (tab: HTMLElement) =>
  `translate(${tab.offsetLeft}px, ${tab.offsetTop + tab.offsetHeight - 2}px) scaleX(${tab.offsetWidth})`

/**
 * Trabajo. Un proyecto a la vez y, de cada uno, su baraja de capturas. Aquí la
 * baraja comparte la página: arriba y abajo sigue siendo scroll; las capturas
 * se pasan de lado, con un clic, con las flechas o con los botones.
 */
export function Portfolio() {
  const [active, setActive] = React.useState(0)
  const [index, setIndex] = React.useState(0)
  const deck = React.useRef<TumbleDeckHandle>(null)
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])
  const listRef = React.useRef<HTMLDivElement>(null)
  const markRef = React.useRef<HTMLSpanElement>(null)
  // La marca se desliza con el puntero; con el teclado, al acomodarse y la primera vez, salta sin animar.
  const instant = React.useRef(true)
  const project = projects[active]
  const cards = React.useMemo(() => project.shots.map((s) => cardFor(project, s)), [project])
  const shot = project.shots[index] ?? project.shots[0]

  const select = (i: number) => {
    if (i === active) return
    setActive(i)
    setIndex(0)
  }
  // Una tarjeta del túnel del inicio pide su proyecto.
  const onPick = React.useEffectEvent((id: string) => {
    const i = projects.findIndex((p) => p.id === id)
    if (i >= 0) select(i)
  })
  React.useEffect(() => {
    const listener = (e: Event) => onPick((e as CustomEvent<string>).detail)
    window.addEventListener(PROJECT_EVENT, listener)
    return () => window.removeEventListener(PROJECT_EVENT, listener)
  }, [])

  // La marca bajo la pestaña elegida, sobre su línea (en el celular hay dos filas). Se mueve con
  // transform (en la GPU), nunca con left, top o width.
  const activeRef = React.useRef(active)
  React.useLayoutEffect(() => {
    activeRef.current = active
    const mark = markRef.current
    const tab = tabs.current[active]
    if (!mark || !tab) return
    mark.style.transition = instant.current ? "none" : ""
    mark.style.transform = markAt(tab)
    mark.style.opacity = "1"
    instant.current = false
  }, [active])
  // Si cambia el ancho (la ventana, el celular que se gira), la marca se acomoda sin deslizarse.
  React.useEffect(() => {
    const list = listRef.current
    const mark = markRef.current
    if (!list || !mark) return
    let first = true
    const ro = new ResizeObserver(() => {
      // La primera llamada llega al empezar a observar: no cambió nada, y cortaría un deslizamiento en curso.
      if (first) {
        first = false
        return
      }
      const tab = tabs.current[activeRef.current]
      if (!tab) return
      mark.style.transition = "none"
      mark.style.transform = markAt(tab)
    })
    ro.observe(list)
    return () => ro.disconnect()
  }, [])

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + projects.length) % projects.length
    instant.current = true
    select(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="trabajo" aria-labelledby="trabajo-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHead
          n={2}
          label="Trabajo"
          crumb="trabajo"
          titleId="trabajo-title"
          title="Páginas que resuelven algo."
          intro="Cuatro proyectos recientes, en producción. Pasa las capturas de lado, con un clic o con las flechas."
          aside
        />

        <div
          ref={listRef}
          role="tablist"
          aria-label="Proyectos"
          className="relative mt-14 grid grid-cols-2 gap-y-6 md:mt-20 lg:grid-cols-4"
        >
          {projects.map((p, i) => {
            const selected = i === active
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                id={`tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="trabajo-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "flex min-w-0 flex-col items-start gap-1.5 border-b border-line pr-4 pb-5 text-left transition-colors duration-150",
                  selected ? "text-white" : "text-gris-texto hover:text-white"
                )}
              >
                <span className="type-crumb text-label">{pad(i + 1)}</span>
                <span className="type-subtitle font-normal text-balance">{p.name}</span>
                <span className="type-crumb hidden text-gris-tenue sm:block">{p.host}</span>
              </button>
            )
          })}
          <span
            ref={markRef}
            aria-hidden="true"
            className="absolute top-0 left-0 h-0.5 w-px origin-left bg-ultramar opacity-0 transition-transform duration-300 ease-in-out motion-reduce:transition-none"
          />
        </div>
      </div>

      <div id="trabajo-panel" role="tabpanel" aria-labelledby={`tab-${project.id}`}>
        {/* El escenario de la baraja: un nivel más abajo, con una luz de Ultramar debajo de las capturas. */}
        <div className="mt-10 border-y border-line bg-hondo bg-[radial-gradient(ellipse_60%_55%_at_50%_62%,rgb(65_104_255/0.09),transparent)]">
          <TumbleDeckShowcase
            key={project.id}
            mode="inline"
            cards={cards}
            handleRef={deck}
            onIndexChange={setIndex}
            height="clamp(340px, min(72vw, 82svh), 860px)"
            cardHeightRatio={0.5}
            narrowWidthRatio={0.88}
            background="transparent"
            sizes={SIZES}
            loading="lazy"
            ariaLabel={`Capturas de ${project.name}`}
            className="mx-auto max-w-[110rem] focus-visible:ring-0"
          />
        </div>

        <div className="shell">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 pt-6">
            <p className="type-crumb min-w-0 text-gris-texto" aria-live="polite">
              <span className="text-white tabular-nums">{pad(index + 1)}</span> <span className="text-label">/</span>{" "}
              <span className="tabular-nums">{pad(project.shots.length)}</span>
              <span className="ml-4 text-niebla">{shot.view}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Captura anterior"
                onClick={() => deck.current?.step(-1)}
                className="size-11 md:size-10"
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Captura siguiente"
                onClick={() => deck.current?.step(1)}
                className="size-11 md:size-10"
              >
                <ArrowRight />
              </Button>
              {/* Un panel privado no se enlaza: la página no anuncia la entrada a un sistema interno. */}
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-crumb ml-3 inline-flex items-center gap-1.5 rounded-sm py-2 text-label transition-colors duration-150 hover:text-white"
                >
                  Ver {project.host}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
          {project.note ? <p className="type-crumb mt-4 text-gris-texto">{project.note}</p> : null}

          <dl className="reveal mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-12">
            {[
              ["Cliente", project.client],
              ["Lo que hicimos", project.built],
              ["Lo que resuelve", project.solves],
            ].map(([term, text]) => (
              <div key={term} className="border-t border-line pt-5">
                <dt className="type-label text-gris-texto">{term}</dt>
                <dd className="type-body mt-3 text-body">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
