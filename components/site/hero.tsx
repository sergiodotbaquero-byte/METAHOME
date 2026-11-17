"use client"

import * as React from "react"
import PerspectiveTunnelHero, { type TunnelItem, type TunnelState } from "@/components/ui/perspective-tunnel-hero"
import { heroTunnel, PROJECT_EVENT } from "@/lib/work"

/*
 * Inicio. METALEVEL en el centro de un túnel. Al bajar, las páginas que hemos
 * hecho —tal como se ven en un celular— salen del fondo y pasan de largo; al
 * final se atraviesa el nombre y sigue la página. Un clic en una tarjeta lleva
 * a su proyecto en Trabajo.
 */

const items: TunnelItem[] = heroTunnel.map((shot) => ({
  src: shot.src,
  srcSet: shot.srcSet,
  alt: shot.alt,
  title: (
    <>
      {shot.short} <span className="text-ultramar-claro">/</span> {shot.view}
    </>
  ),
}))

const SIZES = "(max-width: 767px) 180px, 270px"

export function Hero() {
  const barRef = React.useRef<SVGPathElement>(null)

  // El nombre de la barra superior aparece cuando el METALEVEL del túnel ya se atravesó.
  const onState = React.useCallback(({ progress, anchor }: TunnelState) => {
    document.documentElement.style.setProperty("--hero-pass", (1 - anchor).toFixed(3))
    if (barRef.current) barRef.current.style.strokeDashoffset = String(1 - progress)
  }, [])

  // La barra superior se vuelve sólida cuando el inicio ya quedó atrás.
  React.useEffect(() => {
    const html = document.documentElement
    const track = document.getElementById("inicio")
    if (!track) return
    let raf = 0
    const update = () => {
      raf = 0
      html.dataset.hero = track.getBoundingClientRect().bottom <= 72 ? "past" : "on"
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      html.style.removeProperty("--hero-pass")
      delete html.dataset.hero
    }
  }, [])

  const goToProject = React.useCallback((i: number) => {
    window.dispatchEvent(new CustomEvent(PROJECT_EVENT, { detail: heroTunnel[i].projectId }))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById("trabajo")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }, [])

  return (
    <PerspectiveTunnelHero
      id="inicio"
      aria-labelledby="hero-title"
      items={items}
      sizes={SIZES}
      travel={2.4}
      onStateChange={onState}
      onItemClick={goToProject}
      className="bg-fondo"
      background={
        <>
          {/* La trama, solo hacia los bordes: nunca debajo del nombre. */}
          <div
            aria-hidden="true"
            className="trama pointer-events-none absolute inset-0 [-webkit-mask-image:radial-gradient(ellipse_72%_68%_at_50%_50%,transparent_40%,#000_100%)] [mask-image:radial-gradient(ellipse_72%_68%_at_50%_50%,transparent_40%,#000_100%)]"
          />
          {/* Un poco de Ultramar al fondo del túnel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(65_104_255/0.15)_0%,transparent_62%)]"
          />
        </>
      }
      prompt={<p className="type-label text-gris-texto">Baja para entrar</p>}
      overlay={
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="shell flex justify-end pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-[max(2rem,env(safe-area-inset-bottom))]">
            {/* La barra como avance: a 45°, siempre hacia arriba a la derecha. */}
            <svg viewBox="0 0 40 40" className="size-9 sm:size-11" aria-hidden="true">
              <path d="M5 35 35 5" pathLength={1} stroke="rgb(217 220 225 / 0.18)" strokeWidth={2} strokeLinecap="round" />
              <path
                ref={barRef}
                d="M5 35 35 5"
                pathLength={1}
                className="stroke-ultramar"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset={1}
              />
            </svg>
          </div>
        </div>
      }
    >
      <div className="w-fit">
        <div className="type-label flex items-end justify-between gap-6 text-[0.625rem] sm:text-[0.8125rem]">
          <span className="text-gris-texto">Nivel</span>
          <span className="text-ultramar-claro">Meta · más allá</span>
        </div>
        <div className="mt-3 h-px bg-niebla/25 sm:mt-4" />
        <h1
          id="hero-title"
          className="mt-[0.16em] -mr-[0.2em] text-[clamp(2.5rem,9.6vw,10.5rem)] leading-[1.04] font-light tracking-[0.2em] text-white"
        >
          METALEVEL<span className="sr-only"> code. Código de otro nivel.</span>
        </h1>
        <p aria-hidden="true" className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-left sm:mt-5 md:gap-x-10">
          <span className="font-mono text-[clamp(0.95rem,1.6vw,1.65rem)] tracking-[0.5em] text-ultramar-claro">code</span>
          <span className="text-[clamp(1.05rem,1.8vw,1.8rem)] font-light text-niebla">Código de otro nivel.</span>
        </p>
      </div>
    </PerspectiveTunnelHero>
  )
}
