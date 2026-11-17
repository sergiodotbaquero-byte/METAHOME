// Toma las capturas de los proyectos y las deja en public/work/.
//
//   npm run capturas                 todos los proyectos públicos
//   npm run capturas -- sol servir   solo esos
//   npm run capturas -- servir-panel el panel de Servir Plus (necesita que alguien inicie sesión)
//
// Usa el Edge o el Chrome que ya están instalados (no descarga navegadores).
// Para otro navegador: CHROME_PATH="ruta/al/ejecutable" npm run capturas
//
// Dos juegos:
// - escritorio, para la baraja de Trabajo: ventana de 1440 × 699 (2,06 : 1,
//   la proporción de la baraja), en 640, 1080 y 1600 px;
// - celular, para el túnel del inicio: ventana de 390 × 844, recortada a 4 : 5
//   desde `desde` px, en 400 y 800 px.
// Si agregas un proyecto, súmalo aquí y en lib/work.ts.

import { chromium } from "playwright-core"
import sharp from "sharp"
import { existsSync, mkdirSync } from "node:fs"
import path from "node:path"

const FAROS = "https://faros-app--faros-training-center.us-central1.hosted.app"
const ROBLES = "https://www.liceolosrobles.org"
const SOL = "https://foodsistem.web.app"
const SERVIR = "https://servirpl-cabb8.web.app"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Sol y Café: el menú se abre con el código de una mesa. La misma página publica
// códigos de prueba (1001, 1002, 1003). Solo se mira: nada se agrega ni se pide.
async function solMesa(page) {
  await page.waitForSelector("input", { timeout: 30_000 })
  await sleep(800)
  await page.fill("input", "1001")
  await page.getByRole("button", { name: /Ver el Men/ }).click()
  await page.waitForURL(/\/menu/, { timeout: 30_000 })
  await sleep(2500)
}
const solPortada = async (page) => {
  await page.waitForSelector("input", { timeout: 30_000 })
  await sleep(1500)
}
const solProducto = (nombre) => async (page) => {
  await page.getByRole("button", { name: new RegExp(`^${nombre}`) }).first().click()
  await sleep(1500)
}
const servirAcceso = async () => sleep(3500)

/**
 * Cada página: url, `prepare` (opcional, antes de recorrerla), `offset` (px que
 * tapa una barra fija arriba) y sus capturas: [archivo, selector o null para
 * arriba, desde (solo celular), antes (opcional, justo antes de la foto)].
 */
const PROYECTOS = {
  faros: {
    escritorio: [
      {
        url: `${FAROS}/`,
        shots: [
          ["faros-inicio", null],
          ["faros-info", "#info"],
          ["faros-planes", "#planes"],
          ["faros-media", "#media"],
          ["faros-opiniones", "#opiniones"],
        ],
      },
      { url: `${FAROS}/login`, shots: [["faros-login", null]] },
      { url: `${FAROS}/dashboard/planes`, shots: [["faros-app-planes", null]] },
    ],
    celular: [
      {
        url: `${FAROS}/`,
        shots: [
          ["faros-cel-inicio", null, 110],
          ["faros-cel-planes", "#planes", 60],
          ["faros-cel-media", "#media", 60],
          ["faros-cel-opiniones", "#opiniones", 40],
        ],
      },
      { url: `${FAROS}/login`, shots: [["faros-cel-login", null, 0]] },
      { url: `${FAROS}/dashboard/planes`, shots: [["faros-cel-app-planes", null, 0]] },
    ],
  },
  robles: {
    escritorio: [
      {
        url: `${ROBLES}/`,
        shots: [
          ["robles-inicio", null],
          ["robles-carrusel", ".carousel-container"],
          ["robles-momentos", ".collage"],
          ["robles-mision", ".mission-vision"],
          ["robles-historia", ".history"],
          ["robles-ubicacion", ".location"],
        ],
      },
      { url: `${ROBLES}/RestauranteEscolar/menuEscolar.html`, shots: [["robles-menu", null]] },
      { url: `${ROBLES}/BaseDeDatos/login.php`, shots: [["robles-plataforma", null]] },
    ],
    celular: [
      {
        url: `${ROBLES}/`,
        shots: [
          ["robles-cel-inicio", null, 0],
          ["robles-cel-momentos", ".collage", 0],
          ["robles-cel-historia", ".history", 0],
          ["robles-cel-ubicacion", ".location", 40],
        ],
      },
      { url: `${ROBLES}/RestauranteEscolar/menuEscolar.html`, shots: [["robles-cel-menu", null, 90]] },
      { url: `${ROBLES}/BaseDeDatos/login.php`, shots: [["robles-cel-plataforma", null, 40]] },
    ],
  },
  sol: {
    escritorio: [
      { url: `${SOL}/`, prepare: solPortada, shots: [["sol-inicio", null]] },
      {
        url: `${SOL}/`,
        prepare: solMesa,
        offset: 80,
        shots: [
          ["sol-menu", null],
          ["sol-favoritos", "#sec-populares"],
          ["sol-con-leche", "#sec-con-leche"],
          ["sol-detalle", "#sec-con-leche", 0, solProducto("Capuchino")],
        ],
      },
    ],
    celular: [
      { url: `${SOL}/`, prepare: solPortada, shots: [["sol-cel-inicio", null, 180]] },
      {
        url: `${SOL}/`,
        prepare: solMesa,
        offset: 74,
        shots: [
          ["sol-cel-menu", null, 0],
          ["sol-cel-favoritos", "#sec-populares", 0],
          ["sol-cel-con-leche", "#sec-con-leche", 0],
          ["sol-cel-detalle", "#sec-con-leche", 170, solProducto("Capuchino")],
        ],
      },
    ],
  },
  // Sin sesión: solo la pantalla de acceso. El panel va aparte (servir-panel).
  servir: {
    escritorio: [{ url: `${SERVIR}/#panel`, prepare: servirAcceso, shots: [["servir-acceso", null]] }],
    celular: [{ url: `${SERVIR}/#panel`, prepare: servirAcceso, shots: [["servir-cel-acceso", null, 0]] }],
  },
}

const OUT = path.resolve(import.meta.dirname, "..", "public", "work")
const BROWSERS = [
  process.env.CHROME_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean)

const executablePath = BROWSERS.find((p) => existsSync(p))
if (!executablePath) {
  console.error("No encontré Edge ni Chrome. Indica uno con CHROME_PATH.")
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

async function webp(input, file, widths, region) {
  for (const w of widths) {
    let img = sharp(input)
    if (region) img = img.extract(region)
    await img
      .resize({ width: w })
      .webp({ quality: w <= 640 ? 72 : 76, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT, `${file}-${w}.webp`))
  }
}

async function capture(context, pages, save) {
  for (const { url, shots, prepare, offset = 0 } of pages) {
    const page = await context.newPage()
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 })
    } catch {
      console.warn(`  ${url} no terminó de cargar a tiempo; capturo lo que haya.`)
    }
    await sleep(2500)
    if (prepare) await prepare(page)
    // Recorre la página una vez para que carguen las imágenes diferidas y las animaciones de entrada.
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < height; y += 400) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
      await sleep(140)
    }
    for (const [file, selector, from, before] of shots) {
      const found = await page.evaluate(
        ({ sel, off }) => {
          const el = sel ? document.querySelector(sel) : document.body
          if (!el) return false
          window.scrollTo({ top: sel ? el.getBoundingClientRect().top + window.scrollY - off : 0, behavior: "instant" })
          return true
        },
        { sel: selector, off: offset }
      )
      if (!found) {
        console.warn(`  ${file}: no encontré ${selector}`)
        continue
      }
      await sleep(2000)
      if (before) await before(page)
      await save(await page.screenshot({ caret: "hide" }), file, from)
      console.log(`  ${file}`)
    }
    await page.close()
  }
}

const PHONE_SCALE = 3
const phoneOptions = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: PHONE_SCALE,
  isMobile: true,
  hasTouch: true,
  locale: "es-CO",
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36",
}
const toPhone = (png, file, from, scale = PHONE_SCALE) =>
  webp(png, file, [400, 800], { left: 0, top: from * scale, width: 390 * scale, height: Math.round(390 * 1.25) * scale })

const pedidos = process.argv.slice(2)
const publicos = pedidos.filter((p) => p in PROYECTOS)
const desconocidos = pedidos.filter((p) => !(p in PROYECTOS) && p !== "servir-panel")
if (desconocidos.length) {
  console.error(`No conozco: ${desconocidos.join(", ")}. Opciones: ${Object.keys(PROYECTOS).join(", ")}, servir-panel.`)
  process.exit(1)
}
const elegidos = pedidos.length ? publicos : Object.keys(PROYECTOS)

if (elegidos.length) {
  const browser = await chromium.launch({ executablePath, headless: true })
  console.log(`Escritorio (${elegidos.join(", ")})`)
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 699 }, deviceScaleFactor: 2, locale: "es-CO" })
  await capture(desktop, elegidos.flatMap((k) => PROYECTOS[k].escritorio), (png, file) => webp(png, file, [640, 1080, 1600]))
  await desktop.close()
  console.log("Celular")
  const phone = await browser.newContext(phoneOptions)
  await capture(phone, elegidos.flatMap((k) => PROYECTOS[k].celular), toPhone)
  await phone.close()
  await browser.close()
}

if (pedidos.includes("servir-panel")) {
  const { capturarPanelServir } = await import("./capturar-servir-panel.mjs")
  await capturarPanelServir({ executablePath, base: SERVIR, out: OUT, webp, toPhone })
}

console.log(`Listo: ${OUT}`)
