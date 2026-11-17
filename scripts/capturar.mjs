// Toma las capturas de los proyectos y las deja en public/work/.
//
//   npm run capturas
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

/** Escritorio: [archivo, selector de la sección o null para arriba]. */
const ESCRITORIO = [
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
]

/** Celular: [archivo, selector o null, desde (px de la pantalla donde empieza el recorte 4:5)]. */
const CELULAR = [
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
]

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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
  for (const { url, shots } of pages) {
    const page = await context.newPage()
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 })
    } catch {
      console.warn(`  ${url} no terminó de cargar a tiempo; capturo lo que haya.`)
    }
    await sleep(2500)
    // Recorre la página una vez para que carguen las imágenes diferidas y las animaciones de entrada.
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < height; y += 400) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
      await sleep(140)
    }
    for (const [file, selector, from] of shots) {
      const found = await page.evaluate((sel) => {
        const el = sel ? document.querySelector(sel) : document.body
        if (!el) return false
        window.scrollTo({ top: sel ? el.getBoundingClientRect().top + window.scrollY : 0, behavior: "instant" })
        return true
      }, selector)
      if (!found) {
        console.warn(`  ${file}: no encontré ${selector}`)
        continue
      }
      await sleep(2000)
      await save(await page.screenshot({ caret: "hide" }), file, from)
      console.log(`  ${file}`)
    }
    await page.close()
  }
}

const browser = await chromium.launch({ executablePath, headless: true })

console.log("Escritorio")
const desktop = await browser.newContext({ viewport: { width: 1440, height: 699 }, deviceScaleFactor: 2, locale: "es-CO" })
await capture(desktop, ESCRITORIO, (png, file) => webp(png, file, [640, 1080, 1600]))
await desktop.close()

console.log("Celular")
const SCALE = 3
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: SCALE,
  isMobile: true,
  hasTouch: true,
  locale: "es-CO",
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36",
})
await capture(phone, CELULAR, (png, file, from) =>
  webp(png, file, [400, 800], { left: 0, top: from * SCALE, width: 390 * SCALE, height: Math.round(390 * 1.25) * SCALE })
)
await phone.close()

await browser.close()
console.log(`Listo: ${OUT}`)
