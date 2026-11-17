"use client"

import * as React from "react"
import { nav } from "@/lib/site"

/**
 * Las secciones, en la barra superior. La que está en pantalla queda en
 * blanco: se sabe dónde se está sin tener que buscarlo.
 */
export function SectionNav() {
  const [current, setCurrent] = React.useState<string | null>(null)

  React.useEffect(() => {
    const targets = nav
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null)
    if (!targets.length) return
    // Una franja fina un poco arriba de la mitad de la pantalla: la sección que la cruza es la actual.
    const crossing = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) crossing.set(e.target.id, e.isIntersecting)
        const hit = targets.find((t) => crossing.get(t.id))
        setCurrent(hit ? `#${hit.id}` : null)
      },
      { rootMargin: "-40% 0px -59% 0px" }
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return (
    <nav aria-label="Secciones" className="hidden md:block">
      <ul className="type-crumb flex items-center gap-3 text-gris-texto">
        {nav.map((item, i) => (
          <li key={item.href} className="flex items-center gap-3">
            {i > 0 ? (
              <span aria-hidden="true" className="text-ultramar-claro">
                /
              </span>
            ) : null}
            <a
              href={item.href}
              aria-current={current === item.href ? "true" : undefined}
              className="rounded-sm py-1 transition-colors duration-150 hover:text-white aria-[current=true]:text-white"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
