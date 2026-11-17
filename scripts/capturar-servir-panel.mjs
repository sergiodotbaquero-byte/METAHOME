// El panel de Servir Plus, detrás del inicio de sesión.
//
//   npm run capturas -- servir-panel
//
// Abre una ventana VISIBLE del navegador en el panel. Una persona inicia sesión
// ahí, a mano: este script nunca escribe, lee ni guarda la contraseña. Ya
// adentro, recorre las vistas y, antes de cada captura, difumina en la propia
// página los datos personales de los candidatos: todo texto con palabras que
// no son de la interfaz, los números largos (teléfonos, cédulas), los correos
// y las fotos. Las palabras de la interfaz se leen antes de iniciar sesión,
// cuando en pantalla no hay datos de nadie. La sesión vive en un perfil
// temporal que se borra al cerrar la ventana.
//
// Después de correrlo, revisa las capturas: si algo personal quedó legible,
// no las publiques.

import { chromium } from "playwright-core"

/** [ruta, desde]: la vista y dónde empieza el recorte 4:5 del celular (px), debajo de la barra. */
const VISTAS = [
  ["panel", 165],
  ["candidatos", 165],
  ["whatsapp", 160],
  ["vacantes", 165],
  ["ia", 165],
  ["consola", 165],
]
const SCALE = 2
const ESPERA_MAX = 15 * 60_000
// Palabras comunes de fechas y conectores, para no difuminar «hace 5 min» ni «3 de nov».
const EXTRA =
  "hoy ayer hace min seg am pm de del la las el los en y o a al con sin para por un una mas ver total mes meses semana semanas dia dias hora horas ene feb mar abr may jun jul ago sep oct nov dic enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre lun mie jue vie sab dom".split(
    " "
  )

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Corre en la página: difumina lo que no es de la interfaz. Devuelve cuántos elementos tocó. */
function difuminar(vocab) {
  const V = new Set(vocab)
  const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  const hits = new Set()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = (n.textContent || "").trim()
    const el = n.parentElement
    if (!t || !el || el.closest("script, style, noscript")) continue
    const words = t.match(/\p{L}+/gu) || []
    const unknown = words.some((w) => w.length > 1 && !V.has(norm(w)))
    const personal = /@/.test(t) || /\d[\d\s().+-]{6,}\d/.test(t)
    if (unknown || personal) hits.add(el)
  }
  for (const el of hits) el.style.setProperty("filter", "blur(6px)", "important")
  for (const el of document.querySelectorAll("input, textarea")) if (el.value) el.style.setProperty("filter", "blur(6px)", "important")
  for (const img of document.querySelectorAll("img, video")) {
    if (img.closest("header, #brand-home")) continue
    const r = img.getBoundingClientRect()
    if (r.width > 28 && r.height > 28) img.style.setProperty("filter", "blur(12px)", "important")
  }
  return hits.size
}

export async function capturarPanelServir({ executablePath, base, webp, toPhone }) {
  console.log("Panel de Servir Plus")
  const browser = await chromium.launch({ executablePath, headless: false, args: ["--window-position=60,40", "--window-size=1320,900"] })
  const context = await browser.newContext({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: SCALE, locale: "es-CO" })
  const page = await context.newPage()
  await page.goto(`${base}/#panel`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {})
  await sleep(4000)

  const vocab = await page.evaluate((extra) => {
    const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    const words = (document.body.textContent || "").match(/\p{L}+/gu) || []
    return [...new Set([...words.map(norm), ...extra])]
  }, EXTRA)

  await page.bringToFront()
  console.log("  Inicia sesión en la ventana que se abrió (tienes 15 minutos).")
  const signedIn = () =>
    page
      .evaluate(() => {
        const chip = document.getElementById("auth-user-chip")
        const overlay = document.getElementById("auth-overlay")
        return Boolean(chip && chip.getClientRects().length > 0 && overlay && !overlay.classList.contains("active"))
      })
      .catch(() => false)
  const deadline = Date.now() + ESPERA_MAX
  while (!(await signedIn())) {
    if (Date.now() > deadline) {
      console.log("  Nadie inició sesión. Cierro la ventana sin capturar.")
      await browser.close()
      return
    }
    await sleep(2000)
  }
  console.log("  Sesión iniciada. No toques la ventana mientras captura.")
  await sleep(5000)

  const shoot = async (route) => {
    await page.evaluate((r) => {
      location.hash = `#${r}`
    }, route)
    await sleep(4500)
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < Math.min(h, 4000); y += 500) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
      await sleep(150)
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
    await sleep(800)
    await page.evaluate(difuminar, vocab)
    await sleep(700)
    return page.screenshot({ caret: "hide" })
  }

  await page.setViewportSize({ width: 1440, height: 699 })
  await sleep(1500)
  for (const [route] of VISTAS) {
    await webp(await shoot(route), `servir-${route}`, [640, 1080, 1600])
    console.log(`  servir-${route}`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await sleep(2000)
  for (const [route, from] of VISTAS) {
    await toPhone(await shoot(route), `servir-cel-${route}`, from, SCALE)
    console.log(`  servir-cel-${route}`)
  }

  await browser.close()
  console.log("  Listo. La ventana se cerró y la sesión se borró con ella.")
}
