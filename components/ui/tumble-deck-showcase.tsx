"use client"

import * as React from "react"
import gsap from "gsap"

/*
 * Tumble Deck Showcase — a stack of website screenshots standing on edge, one
 * behind the other. The front card tips forward on its bottom edge and lands
 * flat on the floor, the deck slides up to the line, the next one falls. It is
 * scroll-driven: the wheel, a trackpad or a drag scrubs the deck, and it never
 * runs out — after the last card the first one is standing behind it again,
 * both ways.
 *
 * Pure CSS 3D (one perspective, every card hinged on the same floor line) with
 * a single number driving it — the deck position, which may run any distance. A
 * small pool of card elements is recycled along it: slot j always holds the
 * virtual card k ≡ j (mod pool), showing image k mod n, and a slot is only
 * re-pointed while it is invisible (under the floor pile or past the back).
 *
 * METALEVEL code integration: the original behaviour is `mode="capture"`. A
 * deck inside a long page can't keep the wheel for itself (it never runs out,
 * so the page would never scroll past it), hence two more modes — "inline",
 * which shares the wheel and touch with the page, and "external", which has no
 * input of its own and follows whatever drives `handleRef` (the hero feeds it
 * the page scroll). Cards may also carry a srcSet.
 */

export type TumbleCard = {
  src: string
  alt?: string
  /** Responsive sources ("a-640.webp 640w, a-1600.webp 1600w"). Pair with `sizes`. */
  srcSet?: string
}

/** Drives the deck from outside: buttons, the page scroll, an intro. */
export type TumbleDeckHandle = {
  /** One card forward (1) or back (-1). */
  step: (dir: 1 | -1) => void
  /** Ease toward deck position `pos` (a card index; may be fractional or negative). */
  setTarget: (pos: number) => void
  /** Put the deck at `pos` at once, no easing. */
  jump: (pos: number) => void
}

export type TumbleDeckShowcaseProps = {
  cards: TumbleCard[]
  /** Any CSS length. Default 100svh. */
  height?: number | string
  /** Card width ÷ height. Images are cropped to it from the top. */
  aspect?: number
  /** Wheel / trackpad travel (px) that tips one card. */
  scrollPerCard?: number
  /** How many upright cards show behind the front one. */
  depth?: number
  /** Tallest the front card may get, as a share of the deck's height. */
  cardHeightRatio?: number
  /** Widest the front card may get, as a share of the deck's width, on decks under 420 px. */
  narrowWidthRatio?: number
  background?: string
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
  /**
   * Where input comes from.
   * - "capture" (default): the original — wheel, trackpad and a vertical drag
   *   scrub the deck; the page doesn't scroll while the pointer is over it.
   * - "inline": for a deck inside a scrolling page — up and down (wheel or
   *   touch) stays with the page; sideways swipes, sideways drags, clicks and
   *   the arrow keys flip the deck.
   * - "external": no input of its own; drive it through `handleRef`.
   */
  mode?: "capture" | "inline" | "external"
  handleRef?: React.Ref<TumbleDeckHandle>
  /** The image index (0…n-1) the deck is heading for, whenever it changes. */
  onIndexChange?: (index: number) => void
  /** `sizes` for cards that carry a srcSet. */
  sizes?: string
  loading?: "eager" | "lazy"
  /** Screen-reader hint read after the page count. */
  instructions?: string
}

// #region pose
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Euclidean modulo: card k of an endless deck shows image wrap(k, n). */
export const wrap = (k: number, n: number) => (n ? ((k % n) + n) % n : 0)

/**
 * Hinge angle (deg, CSS rotateX) of a card `t` of the way through its fall.
 * 0 stands upright, -90 lies flat towards the viewer. Gravity eases in, then
 * the card kicks once off the floor and settles.
 */
export function fallAngle(t: number): number {
  const u = clamp01(t)
  const land = 0.78
  if (u <= land) {
    const k = u / land
    return -90 * k * k * k
  }
  const k = (u - land) / (1 - land)
  return -90 + 6 * Math.sin(Math.PI * k) * (1 - k)
}

/** How far the deck has slid forward, in card gaps, at deck position `pos`. */
export function deckAdvance(pos: number): number {
  const i = Math.floor(pos)
  const f = pos - i
  const k = clamp01((f - 0.28) / 0.6)
  return i + k * k * (3 - 2 * k)
}

export type Pose = { angle: number; z: number; lift: number; opacity: number; flat: boolean }

/**
 * Pose of virtual card `k` when the deck is at `pos` (card k is at the front
 * when pos = k). Both may run past the number of images, and below zero.
 */
export function cardPose(k: number, pos: number, depth: number): Pose {
  const t = pos - k
  // Floor cards lie a hair apart, the newest highest. Relative to the front
  // index so the pile doesn't creep upward as the loop runs on.
  const lift = (k - Math.floor(pos) + 3) * 0.6
  if (t >= 1) {
    // On the floor. Only the two latest show.
    return { angle: -90, z: 0, lift, opacity: t < 3 ? 1 : 0, flat: true }
  }
  if (t > 0) return { angle: fallAngle(t), z: 0, lift, opacity: 1, flat: false }
  const rel = k - deckAdvance(pos)
  const opacity = clamp01(depth + 1 - rel)
  return { angle: 0, z: -Math.max(rel, 0), lift: 0, opacity, flat: false }
}
// #endregion

const HINTS: Record<NonNullable<TumbleDeckShowcaseProps["mode"]>, string> = {
  capture: "Desplázate, arrastra, haz clic o usa las flechas para pasarlas.",
  inline: "Desliza de lado, haz clic o usa las flechas para pasarlas.",
  external: "Pasan solas a medida que bajas por la página.",
}

export default function TumbleDeckShowcase({
  cards,
  height = "100svh",
  aspect = 2.06,
  scrollPerCard = 240,
  depth = 5,
  cardHeightRatio = 0.42,
  narrowWidthRatio = 0.76,
  background = "var(--color-background)",
  className,
  style,
  ariaLabel = "Website showcase",
  mode = "capture",
  handleRef,
  onIndexChange,
  sizes,
  loading = "eager",
  instructions,
}: TumbleDeckShowcaseProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = React.useRef<(HTMLImageElement | null)[]>([])
  const slotK = React.useRef<number[]>([])
  const state = React.useRef({ pos: 0 })
  const geo = React.useRef({ h: 200, gap: 44 })
  const n = cards.length
  // Two on the floor, the falling one, the front one, `depth` behind, one fading in.
  const pool = n ? depth + 5 : 0
  const interactive = mode !== "external"

  const paint = React.useCallback(() => {
    const { pos } = state.current
    const { gap } = geo.current
    const base = Math.floor(pos) - 2
    cardRefs.current.forEach((el, j) => {
      const img = imgRefs.current[j]
      if (!el || !img || j >= pool) return
      const k = base + wrap(j - base, pool)
      if (slotK.current[j] !== k) {
        slotK.current[j] = k
        const c = cards[wrap(k, n)]
        // srcset before src, so the browser fetches one candidate, not two.
        if (c.srcSet) img.srcset = c.srcSet
        else img.removeAttribute("srcset")
        img.src = c.src
        img.alt = c.alt ?? ""
      }
      const p = cardPose(k, pos, depth)
      el.style.transform = `translate3d(0, ${-p.lift}px, ${p.z * gap}px) rotateX(${p.angle}deg)`
      el.style.opacity = String(p.opacity)
      el.style.visibility = p.opacity > 0 ? "visible" : "hidden"
      // Light falls from above: a card darkens a touch as it tips away from it.
      const shade = p.flat ? 0.06 : (-p.angle / 90) * 0.06
      el.style.setProperty("--td-shade", String(shade))
    })
  }, [depth, pool, cards, n])

  // New images: re-point every slot on the next paint.
  React.useLayoutEffect(() => {
    slotK.current = []
  }, [cards])

  // Fit: the card, the deck above it and the floor card below all inside the
  // root. Perspective and eye height are fixed ratios of the card height,
  // measured off the reference composition.
  React.useLayoutEffect(() => {
    const root = rootRef.current
    const scene = sceneRef.current
    if (!root || !scene) return
    const fit = () => {
      const W0 = root.clientWidth
      const H0 = root.clientHeight
      const wFrac = W0 < 420 ? narrowWidthRatio : 0.655
      const h = Math.max(60, Math.min((W0 * wFrac) / aspect, H0 * cardHeightRatio, 620))
      const w = h * aspect
      const top = H0 / 2 - 0.62 * h
      geo.current = { h, gap: 0.24 * h }
      scene.style.perspective = `${6 * h}px`
      scene.style.perspectiveOrigin = `50% ${top - 1.66 * h}px`
      root.style.setProperty("--td-w", `${w}px`)
      root.style.setProperty("--td-h", `${h}px`)
      root.style.setProperty("--td-top", `${top}px`)
      paint()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(root)
    return () => ro.disconnect()
  }, [aspect, cardHeightRatio, narrowWidthRatio, paint])

  const api = React.useRef<TumbleDeckHandle>({ step: () => {}, setTarget: () => {}, jump: () => {} })
  React.useImperativeHandle(
    handleRef,
    () => ({
      step: (dir) => api.current.step(dir),
      setTarget: (pos) => api.current.setTarget(pos),
      jump: (pos) => api.current.jump(pos),
    }),
    []
  )
  const emitIndex = React.useEffectEvent((index: number) => onIndexChange?.(index))

  // Wheel, trackpad and drag push a target position; the deck eases after it
  // every frame and, once the input goes quiet, settles on the nearest whole
  // card so nothing is left half-fallen. No autoplay.
  const dragged = React.useRef(false)
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || n === 0) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const s = state.current
    let target = s.pos
    let running = false
    let idle: ReturnType<typeof setTimeout> | undefined
    let acc = 0
    let reported = Number.NaN
    let lastOuter = s.pos

    const report = () => {
      const index = wrap(Math.round(target), n)
      if (index !== reported) {
        reported = index
        emitIndex(index)
      }
    }
    const follow = () => {
      const dt = gsap.ticker.deltaRatio(60) / 60
      s.pos += (target - s.pos) * (1 - Math.exp(-dt * 9))
      if (Math.abs(target - s.pos) < 2e-3) {
        s.pos = target
        gsap.ticker.remove(follow)
        running = false
      }
      paint()
    }
    const run = () => {
      if (reduce) {
        s.pos = target
        paint()
      } else if (!running) {
        running = true
        gsap.ticker.add(follow)
      }
    }
    const push = (to: number) => {
      // A hard fling still travels card by card instead of skipping the deck.
      target = Math.max(Math.round(s.pos) - 3, Math.min(Math.round(s.pos) + 3, to))
      report()
      run()
    }
    // Settle on a whole card, leaning the way the input was heading.
    const settle = (bias = 0) =>
      push(bias > 0 ? Math.floor(target + 0.7) : bias < 0 ? Math.ceil(target - 0.7) : Math.round(target))

    api.current = {
      step: (dir) => push(Math.round(target) + dir),
      // From outside (the page scroll): follow freely — the driver already
      // rations the travel — and settle once it rests.
      setTarget: (pos) => {
        clearTimeout(idle)
        const bias = Math.sign(pos - lastOuter)
        lastOuter = pos
        target = reduce ? Math.round(pos) : pos
        report()
        run()
        if (!reduce) idle = setTimeout(() => settle(bias), 160)
      },
      jump: (pos) => {
        clearTimeout(idle)
        gsap.ticker.remove(follow)
        running = false
        lastOuter = pos
        target = reduce ? Math.round(pos) : pos
        s.pos = target
        report()
        paint()
      },
    }
    report()
    paint()

    if (mode === "external") {
      return () => {
        clearTimeout(idle)
        gsap.ticker.remove(follow)
      }
    }

    // Inline decks only take sideways gestures; up and down belongs to the page.
    const sideways = mode === "inline"

    const onWheel = (e: WheelEvent) => {
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (sideways && ax <= ay) return
      e.preventDefault()
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? root.clientHeight : 1
      const d = (ax > ay ? e.deltaX : e.deltaY) * scale
      if (reduce) {
        // No scrubbing: whole cards only, one per `scrollPerCard` of travel.
        acc += d
        while (Math.abs(acc) >= scrollPerCard) {
          const dir = Math.sign(acc)
          acc -= dir * scrollPerCard
          push(target + dir)
        }
        return
      }
      push(target + d / scrollPerCard)
      clearTimeout(idle)
      idle = setTimeout(() => settle(Math.sign(d)), 140)
    }

    let drag: { id: number; x: number; y: number; travel: number; cross: number; last: number } | null = null
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, travel: 0, cross: 0, last: 0 }
      dragged.current = false
      clearTimeout(idle)
    }
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = drag.x - e.clientX
      const dy = drag.y - e.clientY
      drag.x = e.clientX
      drag.y = e.clientY
      // Drag up (capture) or left (inline) = the deck moves on.
      const d = sideways ? dx : dy
      drag.travel += Math.abs(d)
      drag.cross += Math.abs(sideways ? dy : dx)
      if (d) drag.last = Math.sign(d)
      if (drag.travel > 6 && !dragged.current && (!sideways || drag.travel > drag.cross)) {
        dragged.current = true
        root.setPointerCapture(e.pointerId)
      }
      if (dragged.current && !reduce) {
        // One card per card height (up/down) or per card width (sideways).
        const span = sideways ? geo.current.h * aspect * 0.9 : geo.current.h * 1.1
        push(target + d / span)
      }
    }
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (dragged.current) {
        if (reduce) push(Math.round(target) + (drag.last || 0))
        else settle(drag.last)
      }
      drag = null
    }

    root.addEventListener("wheel", onWheel, { passive: false })
    root.addEventListener("pointerdown", onDown)
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerup", onUp)
    root.addEventListener("pointercancel", onUp)
    return () => {
      clearTimeout(idle)
      gsap.ticker.remove(follow)
      root.removeEventListener("wheel", onWheel)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerup", onUp)
      root.removeEventListener("pointercancel", onUp)
    }
  }, [n, scrollPerCard, paint, mode, aspect])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
      e.preventDefault()
      api.current.step(1)
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      api.current.step(-1)
    }
  }

  const touch = mode === "capture" ? "touch-none" : mode === "inline" ? "touch-pan-y" : ""

  return (
    <div
      ref={rootRef}
      role={interactive ? "region" : "group"}
      aria-roledescription={interactive ? "carousel" : undefined}
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? onKey : undefined}
      onClick={
        interactive
          ? () => {
              if (!dragged.current) api.current.step(1)
            }
          : undefined
      }
      data-mode={mode}
      className={["td-root relative w-full overflow-hidden outline-none select-none", touch, className]
        .filter(Boolean)
        .join(" ")}
      style={{ height, background, overscrollBehaviorX: mode === "inline" ? "contain" : undefined, ...style }}
    >
      <style>{`
        .td-scene { position: absolute; inset: 0; transform-style: preserve-3d; }
        .td-card {
          position: absolute; left: 50%; top: var(--td-top);
          width: var(--td-w); height: var(--td-h); margin-left: calc(var(--td-w) / -2);
          transform-origin: 50% 100%; transform-style: preserve-3d;
          backface-visibility: visible; will-change: transform;
          border-radius: 3px; overflow: hidden; cursor: pointer;
          background: color-mix(in oklab, var(--color-foreground) 8%, var(--color-background));
          box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-foreground) 10%, transparent);
        }
        .td-root[data-mode="external"] .td-card { cursor: default; }
        .td-card img {
          display: block; width: 100%; height: 100%; max-width: none;
          object-fit: cover; object-position: 50% 0%; pointer-events: none;
        }
        .td-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: #000; opacity: var(--td-shade, 0);
        }
        .td-root:focus-visible { box-shadow: inset 0 0 0 2px var(--color-primary); }
      `}</style>
      <div ref={sceneRef} className="td-scene">
        {Array.from({ length: pool }, (_, j) => (
          <div
            key={j}
            ref={(el) => {
              cardRefs.current[j] = el
            }}
            className="td-card"
          >
            {/* src/srcset/alt are set in paint() as the slot moves along the deck,
                so next/image can't own them; the cards carry their own srcSet. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                imgRefs.current[j] = el
              }}
              alt=""
              width={720}
              height={Math.round(720 / aspect)}
              sizes={sizes}
              loading={loading}
              draggable={false}
              decoding="async"
            />
          </div>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {n} páginas. {instructions ?? HINTS[mode]}
      </span>
    </div>
  )
}
