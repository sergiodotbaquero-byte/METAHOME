// Sirve la página exportada (out/) como la va a servir GitHub Pages.
//
//   npm run build && npm start                         en http://localhost:4173/
//   NEXT_PUBLIC_BASE_PATH=/METAHOME npm run build && NEXT_PUBLIC_BASE_PATH=/METAHOME npm start
//                                                      en http://localhost:4173/METAHOME/
//
// Sin dependencias: un servidor de archivos mínimo, solo para mirar antes de subir.

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..", "out")
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const PORT = Number(process.env.PORT ?? 4173)
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

async function find(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "")
  const file = path.join(ROOT, clean)
  if (!file.startsWith(ROOT)) return null
  for (const candidate of [file, `${file}.html`, path.join(file, "index.html")]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate
    } catch {}
  }
  return null
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost")
  if (BASE && !pathname.startsWith(BASE)) {
    res.writeHead(302, { location: `${BASE}/` }).end()
    return
  }
  const file = await find(pathname.slice(BASE.length) || "/")
  if (!file) {
    const notFound = await find("/404")
    res.writeHead(404, { "content-type": TYPES[".html"] }).end(notFound ? await readFile(notFound) : "404")
    return
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(await readFile(file))
}).listen(PORT, () => console.log(`Página exportada en http://localhost:${PORT}${BASE}/`))
