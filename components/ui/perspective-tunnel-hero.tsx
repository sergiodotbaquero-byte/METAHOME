"use client"

import * as React from "react"
import {
  animate,
  domAnimation,
  LazyMotion,
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

/*
 * Perspective Tunnel Hero — cards fly out of the depth of a 3D corridor,
 * around an anchor in the middle (the title), and rush past the viewer as the
 * visitor scrolls. Each card has its own stretch of the flight (staggered),
 * comes in from far away, passes and fades.
 *
 * Every card flies its own lane, and the lanes are laid out from the anchor's
 * measured box: a card shows up just clear of the anchor and perspective only
 * carries it outward from there, so the cards ring the anchor and never pile
 * up over it. Directions where a card would hardly be seen (the ends of a wide
 * title on a phone) are left empty.
 *
 * Integrated into METALEVEL code from the original wheel-driven version: here
 * the PAGE scroll flies the tunnel. The hero is a tall track with a stage
 * pinned to the screen (sticky) while the track scrolls by, so the wheel,
 * the trackpad, touch, the keyboard and the scrollbar all work, and once the
 * tunnel is flown the page simply carries on.
 */

export type TunnelItem = {
  src: string
  srcSet?: string
  alt?: string
  /** Label over the foot of the card. */
  title: React.ReactNode
}

export type TunnelState = {
  /** 0 → 1 along the scroll track (smoothed). */
  progress: number
  /** Opacity of the anchor: 1 while it rules the stage, 0 once flown through. */
  anchor: number
}

export type PerspectiveTunnelHeroProps = {
  items: TunnelItem[]
  /** The anchor in the middle of the tunnel. The cards fly around it. */
  children: React.ReactNode
  /** Hint at the bottom; it leaves as soon as the flight starts. */
  prompt?: React.ReactNode
  /** Layers behind everything (grid, glow…). */
  background?: React.ReactNode
  /** Layers over everything inside the pinned stage (progress, HUD…). */
  overlay?: React.ReactNode
  /** Page scroll that flies the whole tunnel, in viewport heights. */
  travel?: number
  /** How far into the flight the tunnel opens on arrival (cards already in the air). */
  intro?: number
  /** Where a reduced-motion visitor sees the tunnel, held still. */
  restAt?: number
  /** `sizes` for items that carry a srcSet. */
  sizes?: string
  onItemClick?: (index: number) => void
  onStateChange?: (state: TunnelState) => void
  id?: string
  className?: string
  "aria-labelledby"?: string
}

type TunnelCardData = {
  item: TunnelItem
  rotationZ: number
  /** How much further out than the closest it could, the card's lane starts. */
  spread: number
  index: number
}

type StageDimensions = {
  width: number
  height: number
  isMobile: boolean
  /** The anchor's own box, unscaled. */
  anchorWidth: number
  anchorHeight: number
}

/** A card's lane: its offset from the axis of the tunnel, in 3D px. */
type Lane = { x: number; y: number }

type Box = { x: number; y: number }

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 }

/** The anchor's scale through most of the flight (it is flown through at the end). */
const ANCHOR_MID_SCALE = 1.05
const CARD_RATIO = 5 / 4 // portrait 4 : 5
/** Share of the whole flight each card spends in the air. */
const STAGGER_SPAN = 0.55
/** Px a card keeps from the screen's edge when it shows up. */
const EDGE = 6
/** Share of its flight a card should spend on screen for its stretch of the ring to be used. */
const MIN_LIFE = 0.5
/** Points the ring around the anchor is walked in. */
const RING_STEPS = 720
/** On screen, y down: the first card goes up and to the right. */
const FIRST_DIRECTION = { cos: 0.64, sin: -0.77 }
const GOLDEN = 0.6180339887
/** Lanes don't all start right at the anchor, so the ring isn't a single line. */
const SPREAD = [1, 1.16, 1.06, 1.24, 1.1, 1.2]

type Direction = { cos: number; sin: number }

// Server and browser may disagree on the last digit of a sine; rounding keeps
// the server-rendered style identical to the first client render (hydration).
const round = (v: number, places: number) => Math.round(v * 10 ** places) / 10 ** places
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function unit(deg: number): Direction {
  const rad = (deg * Math.PI) / 180
  return { cos: round(Math.cos(rad), 6), sin: round(Math.sin(rad), 6) }
}

/** The point `d` px along the edge of a box (half sizes `rx`, `ry`), clockwise from the top centre. */
function onRing(d: number, rx: number, ry: number) {
  if (d < rx) return { x: d, y: -ry }
  d -= rx
  if (d < 2 * ry) return { x: rx, y: d - ry }
  d -= 2 * ry
  if (d < 2 * rx) return { x: rx - d, y: ry }
  d -= 2 * rx
  if (d < 2 * ry) return { x: -rx, y: ry - d }
  d -= 2 * ry
  return { x: d - rx, y: -ry }
}

/**
 * Depth of a card along its flight (0 → 1). It eases in: the card lingers by
 * the ring around the anchor, then rushes past the viewer.
 */
const depthAt = (t: number, farZ: number, nearZ: number) => farZ + (nearZ - farZ) * t * t

/** Depth of the flight and size of the cards. Phones get a shorter tunnel. */
function rig({ width, isMobile }: StageDimensions) {
  return isMobile
    ? { perspective: 900, farZ: -1200, nearZ: 350, cardWidth: clamp(width * 0.38, 130, 180), pan: 20, air: 14 }
    : { perspective: 1200, farZ: -1700, nearZ: 500, cardWidth: clamp(width * 0.18, 180, 270), pan: 45, air: 22 }
}

function layout(items: TunnelItem[]): TunnelCardData[] {
  return items.map((item, i) => ({
    item,
    rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
    spread: SPREAD[i % SPREAD.length],
    index: i,
  }))
}

/**
 * Lays the lanes out around the anchor. A card shows up at the scale of the
 * far end of the tunnel, on a ring just clear of the anchor (at its mid-flight
 * size, plus some air and the pointer's drift); from there perspective only
 * carries it outward, so it never crosses the anchor. The cards are spread
 * evenly along the ring, not by angle, so a wide title gets cards along its
 * whole length instead of a clump over its middle.
 */
function planLanes(cards: TunnelCardData[], stage: StageDimensions): Lane[] {
  const { perspective, farZ, nearZ, cardWidth, pan, air } = rig(stage)
  const cardHeight = cardWidth * CARD_RATIO
  const appear = perspective / (perspective - farZ) // a card's scale when it shows up
  const halfW = stage.width / 2
  const halfH = stage.height / 2
  const margin = air + pan * appear
  const keepX = (stage.anchorWidth / 2) * ANCHOR_MID_SCALE + margin
  const keepY = (stage.anchorHeight / 2) * ANCHOR_MID_SCALE + margin

  // Half the box of a card tilted by `deg`.
  const box = (deg: number): Box => {
    const { cos, sin } = unit(deg)
    const c = Math.abs(cos)
    const s = Math.abs(sin)
    return { x: (cardWidth * c + cardHeight * s) / 2, y: (cardWidth * s + cardHeight * c) / 2 }
  }
  // How far out along a direction, on screen, a card shows up: just clear of the anchor.
  const startAt = (cos: number, sin: number, half: Box) =>
    Math.min(
      cos !== 0 ? (keepX + appear * half.x) / Math.abs(cos) : Infinity,
      sin !== 0 ? (keepY + appear * half.y) / Math.abs(sin) : Infinity
    )
  // Share of its flight a card spends on screen: until its inner edge crosses
  // the screen's edge (scale × (lane − half card) > half screen).
  const life = (lane: Lane, half: Box) => {
    const leaveAt = (offset: number, cardHalf: number, screenHalf: number) =>
      offset > cardHalf ? screenHalf / (offset - cardHalf) : Infinity
    const scale = Math.min(leaveAt(Math.abs(lane.x), half.x, halfW), leaveAt(Math.abs(lane.y), half.y, halfH))
    if (!Number.isFinite(scale)) return 1
    // The depth reached at that scale, back to time along the flight (see depthAt).
    return Math.sqrt(clamp((perspective - perspective / scale - farZ) / (nearZ - farZ), 0, 1))
  }

  // The ring where cards show up: the anchor's box grown by half a tilted card.
  // Walk it in even steps and keep the stretches where a card shows up whole
  // and stays on screen a while.
  const typical = box(11)
  const ringX = keepX + appear * typical.x
  const ringY = keepY + appear * typical.y
  const all: Direction[] = []
  const partly: Direction[] = []
  const whole: Direction[] = []
  for (let k = 0; k < RING_STEPS; k++) {
    const { x, y } = onRing(((k + 0.5) / RING_STEPS) * 4 * (ringX + ringY), ringX, ringY)
    const length = Math.sqrt(x * x + y * y)
    const direction = { cos: round(x / length, 6), sin: round(y / length, 6) }
    all.push(direction)
    if (Math.abs(x) > halfW || Math.abs(y) > halfH) continue
    partly.push(direction)
    const fits = Math.abs(x) + appear * typical.x <= halfW - EDGE && Math.abs(y) + appear * typical.y <= halfH - EDGE
    if (fits && life({ x: x / appear, y: y / appear }, typical) >= MIN_LIFE) whole.push(direction)
  }
  // With hardly any room around the anchor (a phone on its side), cards partly in view will do.
  const open = whole.length >= cards.length * 4 ? whole : partly.length > 0 ? partly : all

  // The golden ratio spreads the cards over the open stretches, so cards that
  // fly one after another land far apart.
  const towardFirst = (d: Direction) => d.cos * FIRST_DIRECTION.cos + d.sin * FIRST_DIRECTION.sin
  let first = 0
  for (let i = 1; i < open.length; i++) {
    if (towardFirst(open[i]) > towardFirst(open[first])) first = i
  }
  return cards.map((card) => {
    const pick = (first / open.length + card.index * GOLDEN) % 1
    const { cos, sin } = open[Math.floor(pick * open.length)]
    const half = box(card.rotationZ)
    const r = startAt(cos, sin, half)
    // Room to start further out without showing up past the screen's edge.
    const room = Math.min(
      cos !== 0 ? (halfW - EDGE - appear * half.x) / (r * Math.abs(cos)) : Infinity,
      sin !== 0 ? (halfH - EDGE - appear * half.y) / (r * Math.abs(sin)) : Infinity
    )
    const radius = (r * clamp(card.spread, 1, Math.max(1, room))) / appear
    return { x: round(radius * cos, 2), y: round(radius * sin, 2) }
  })
}

/** The camera drifts against the pointer. Only with a real pointer — touch would jolt it. */
function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING_CONFIG)
  const y = useSpring(rawY, SPRING_CONFIG)

  React.useEffect(() => {
    if (!enabled || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [enabled, rawX, rawY])

  return { x, y }
}

type TunnelCardProps = {
  card: TunnelCardData
  lane: Lane
  progress: MotionValue<number>
  pointer: { x: MotionValue<number>; y: MotionValue<number> }
  total: number
  stage: StageDimensions
  sizes?: string
  onClick?: () => void
}

function TunnelCard({ card, lane, progress, pointer, total, stage, sizes, onClick }: TunnelCardProps) {
  const start = (card.index / total) * (1 - STAGGER_SPAN)
  const end = start + STAGGER_SPAN

  const localProgress = useTransform(progress, [start, end], [0, 1])

  const { farZ, nearZ, cardWidth, pan } = rig(stage)
  const z = useTransform(localProgress, (t) => depthAt(t, farZ, nearZ))

  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0])

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const offsetX = (lane.x - px * pan).toFixed(2)
    const offsetY = (lane.y - py * pan).toFixed(2)
    return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ.toFixed(1)}px) rotateZ(${card.rotationZ}deg)`
  })

  return (
    <m.div
      style={{ width: cardWidth, transform, opacity, zIndex: card.index + 1 }}
      onClick={onClick}
      className={[
        "pointer-events-auto absolute top-1/2 left-1/2 aspect-[4/5] will-change-transform select-none",
        onClick ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-negro shadow-2xl shadow-black/80 ring-1 ring-white/15 transition-shadow duration-300 ease-out hover:shadow-ultramar/25 hover:ring-ultramar/70">
        {/* eslint-disable-next-line @next/next/no-img-element -- moves in 3D every frame; next/image adds nothing here */}
        <img
          src={card.item.src}
          srcSet={card.item.srcSet}
          sizes={sizes}
          alt={card.item.alt ?? ""}
          draggable={false}
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out motion-safe:group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/10 to-transparent p-4 sm:p-5">
          <span className="font-mono text-xs tracking-widest text-white/95 uppercase drop-shadow-md sm:text-sm">
            {card.item.title}
          </span>
        </div>
      </div>
    </m.div>
  )
}

export default function PerspectiveTunnelHero({
  items,
  children,
  prompt,
  background,
  overlay,
  travel = 2.4,
  intro = 0,
  restAt = 0.14,
  sizes,
  onItemClick,
  onStateChange,
  id,
  className,
  "aria-labelledby": labelledBy,
}: PerspectiveTunnelHeroProps) {
  const trackRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const cards = React.useMemo(() => layout(items), [items])

  const [stage, setStage] = React.useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
    anchorWidth: 0,
    anchorHeight: 0,
  })
  const lanes = React.useMemo(() => planLanes(cards, stage), [cards, stage])

  // Measure the pinned stage itself (100svh): on phones it doesn't change when
  // the address bar slides, so the cards don't jump mid-scroll. And the anchor,
  // whose size (fonts loading included) decides where the lanes run.
  React.useLayoutEffect(() => {
    const el = stageRef.current
    const anchor = anchorRef.current
    if (!el || !anchor) return
    const measure = () => {
      const pad = getComputedStyle(anchor)
      // Layout size of the anchor's content: its scale doesn't count.
      const anchorWidth = Math.round(anchor.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight))
      const anchorHeight = Math.round(anchor.clientHeight - parseFloat(pad.paddingTop) - parseFloat(pad.paddingBottom))
      const width = el.clientWidth
      const height = el.clientHeight
      const isMobile = width < 768
      setStage((prev) =>
        prev.width === width &&
        prev.height === height &&
        prev.isMobile === isMobile &&
        prev.anchorWidth === anchorWidth &&
        prev.anchorHeight === anchorHeight
          ? prev
          : { width, height, isMobile, anchorWidth, anchorHeight }
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(anchor)
    return () => ro.disconnect()
  }, [])

  // The page scroll across the track drives the flight, through a spring.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 })

  // On arrival the first cards are already in the air; with reduced motion the
  // tunnel holds still at `restAt` (frozen ≥ 0) and the page scrolls on by.
  const opening = useMotionValue(0)
  const frozen = useMotionValue(-1)
  const progress = useTransform([smoothProgress, opening, frozen], ([s, o, f]: number[]) =>
    f >= 0 ? f : o + s * (1 - o)
  )
  const anchorProgress = useTransform([smoothProgress, frozen], ([s, f]: number[]) => (f >= 0 ? 0 : s))

  React.useEffect(() => {
    if (reduce) {
      frozen.set(restAt)
      return
    }
    frozen.set(-1)
    if (intro <= 0) return
    const controls = animate(opening, intro, { duration: 1.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [reduce, intro, restAt, frozen, opening])

  const pointer = useCameraParallax(!reduce)

  // The anchor stays crisp through the flight and is flown through at the end.
  const titleScale = useTransform(anchorProgress, [0, 0.7, 1], [1, ANCHOR_MID_SCALE, 1.32])
  const titleOpacity = useTransform(anchorProgress, [0, 0.8, 0.97], [1, 1, 0])
  const promptOpacity = useTransform(anchorProgress, [0, 0.06], [1, 0])

  // Tell the page where the flight is (it drives the header and the progress bar).
  const onStateRef = React.useRef(onStateChange)
  React.useEffect(() => {
    onStateRef.current = onStateChange
  })
  useMotionValueEvent(anchorProgress, "change", (p) => onStateRef.current?.({ progress: p, anchor: titleOpacity.get() }))
  React.useEffect(() => {
    onStateRef.current?.({ progress: anchorProgress.get(), anchor: titleOpacity.get() })
  }, [anchorProgress, titleOpacity])

  // `m` + LazyMotion(domAnimation): what renders motion values, without the
  // drag and layout machinery of the full `motion` component (lighter on phones).
  return (
    <LazyMotion features={domAnimation}>
    <section
      ref={trackRef}
      id={id}
      aria-labelledby={labelledBy}
      // The track: one screen pinned, plus `travel` screens of scroll to fly it.
      style={{ "--tunnel-travel": `${travel * 100}vh` } as React.CSSProperties}
      className={[
        "relative h-[calc(100svh_+_var(--tunnel-travel))] motion-reduce:h-svh",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden select-none"
        style={{ perspective: `${rig(stage).perspective}px`, transformStyle: "preserve-3d" }}
      >
        {background}

        {/* Anchor */}
        <m.div
          ref={anchorRef}
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none z-0 flex flex-col items-center px-6 text-center"
        >
          {children}
        </m.div>

        {prompt ? (
          <m.div
            style={{ opacity: promptOpacity }}
            className="pointer-events-none absolute bottom-[max(2rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-2"
          >
            {prompt}
          </m.div>
        ) : null}

        {/* 3D Z-space plane. Decorative: the same work is shown, and reachable, further down. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map((card, i) => (
            <TunnelCard
              key={i}
              card={card}
              lane={lanes[i]}
              progress={progress}
              pointer={pointer}
              total={cards.length}
              stage={stage}
              sizes={sizes}
              onClick={onItemClick ? () => onItemClick(i) : undefined}
            />
          ))}
        </div>

        {overlay}
      </div>
    </section>
    </LazyMotion>
  )
}
