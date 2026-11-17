"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * La lista del proceso. Si al cargar todavía no está a la vista, espera
 * plegada y se dibuja una vez, de abajo arriba, cuando aparece (globals.css,
 * `.escalera`). Sin JavaScript, o con movimiento reducido, ya está dibujada.
 */
export function Escalera({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLOListElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // Ya a la vista (se llegó con un enlace, o al recargar más abajo): se queda como está.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.7) return
    el.dataset.estado = "espera"
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.dataset.estado = "sube"
        io.disconnect()
      },
      { rootMargin: "0px 0px -30% 0px" }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      delete el.dataset.estado
    }
  }, [])

  return (
    <ol ref={ref} className={cn("escalera", className)}>
      {children}
    </ol>
  )
}
